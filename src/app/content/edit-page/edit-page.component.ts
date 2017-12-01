import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { ActivatedRoute } from '@angular/router';

import { ContentService } from '../shared/content.service';
import { Config } from '../../core/shared/model/config';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { ContentItem } from '../shared/model/content-item';
import { FormBuilder, FormGroup } from '@angular/forms';
import 'rxjs/add/observable/of';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { ContentViewComponent } from '../content-view/content-view.component';
import { User } from '../../user/shared/user';
import { DynamicComponentDirective } from '../shared/directive/dynamic-component.directive';
import { ContentItemTransaction } from '../shared/model/content-item-transaction';
import { UserService } from '../../user/shared/user.service';
import { ContentObject } from '../shared/model/content-object';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  private user: User;

  config: Config;
  pageConfig: ContentPageConfig;
  form: FormGroup;
  id: string;
  page: string;

  contentItems = new Array<ContentItem>();
  contentItem$ = new ReplaySubject<ContentItem>();

  snackBarConfig = new MatSnackBarConfig();
  snackBarTimeout: any;
  transaction: ContentItemTransaction;

  @ViewChild(DynamicComponentDirective) contentViewDirective: DynamicComponentDirective;
  @ViewChild(ContentViewComponent) contentViewComponent: ContentViewComponent;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private titleService: Title,
    private contentService: ContentService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.snackBarConfig.duration = 5000;
    this.transaction = new ContentItemTransaction(this.contentService);
  }

  ngOnInit() {
    this.user = this.userService.getUser();
    this.form = this.createForm();

    this.route.paramMap.takeUntil(this.componentDestroyed).subscribe(params => {
      this.page = params.get('page');
      this.id = params.get('id');

      this.route.data.takeUntil(this.componentDestroyed).subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()].editPageConfig;
        this.titleService.setTitle(this.pageConfig.pageName);

        this.contentService
          .read(this.id)
          .takeUntil(this.componentDestroyed)
          .subscribe(
            contentItem => {
              console.log('Loaded content item: ' + contentItem.id);
              this.transaction.reset();
              this.contentItem$.next(contentItem);
              const index = this.transaction.addItem(contentItem);
              this.transaction.selectObject(index);
            },
            err => console.error('There was an error reading the content-item:', err) // TODO: Handle error
          );
      });
    });
    this.transaction.selectedContentObject$.subscribe(contentObject => {
      if (contentObject) {
        contentObject.loaded$.subscribe(() => {
          this.loadContentViewComponent(contentObject);
        });
      } else {
        this.unloadContentViewComponent();
      }
    });
  }

  addFile(file: File) {
    console.log('Added file');
    const index = this.transaction.addFile(file);
    this.transaction.selectObject(index);
  }

  loadContentViewComponent(contentObject: ContentObject) {
    console.log('Loading content view component');
    if (this.componentFactoryResolver) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ContentViewComponent);

      if (this.contentViewDirective) {
        const viewContainerRef = this.contentViewDirective.viewContainerRef;
        if (viewContainerRef) {
          viewContainerRef.clear();
          const componentRef = viewContainerRef.createComponent(componentFactory);
          (<ContentViewComponent>componentRef.instance).onContentObjectChanged(contentObject);
        }
      }
    }
  }

  replaceFile(contentObject: ContentObject, file: File) {
    // Replace can only be performed on a persisted content item
    if (contentObject.item) {
      console.log('Replaced file for ' + contentObject.item.id);
      contentObject.setFile(file);
      this.contentItem$.next(contentObject.item);
    }
  }

  saveItem() {
    const fields = this.pageConfig.fieldsToDisplay;
    const formModel = this.form.value;
    const metadataDefaults = new Array<any>();
    if (this.config) {
      if (this.config.profile) {
        metadataDefaults.push({
          name: 'ProfileId',
          value: this.config.profile
        });
      }
      if (this.config.account) {
        metadataDefaults.push({
          name: 'Account',
          value: this.config.account.replace('${user}', this.user.userName)
        });
      }
    }

    const metadataOverrides = this.pageConfig.onSave;
    const transaction = this.transaction;
    const contentItemObservables = new Array<Observable<ContentItem>>();
    const contentObjects = transaction.contentObjects;

    if (contentObjects) {
      const numberOfContentObjects = contentObjects.length;
      this.contentItems = new Array<ContentItem>();
      for (const contentObject of contentObjects) {
        const contentItem = this.transaction.prepareItem(contentObject.item, fields, formModel);
        let contentItem$;
        if (contentObject.item) {
          contentItem$ = this.contentService.update(contentItem, contentObject.getFile());
        } else {
          contentItem$ = this.contentService.create(contentItem, contentObject.getFile());
        }
        contentItem$.subscribe(item => {
          let index = 0;
          let existingIndex = -1;
          for (const current of this.contentItems) {
            if (current.id === item.id) {
              existingIndex = index;
            }
            index++;
          }
          console.log('Item Updated: ' + item.id);
          contentObject.onLoad(item);

          if (existingIndex === -1) {
            this.contentItems.push(item);
          }

          if (this.snackBarTimeout) {
            clearTimeout(this.snackBarTimeout);
            this.snackBarTimeout = null;
          }
          this.snackBarTimeout = setTimeout(() => {
            const numberOfItems = this.contentItems.length;
            const message = numberOfItems === 1 ? '1 item updated' : numberOfItems + ' items updated';
            const snackBarRef = this.snackBar.open(message, 'Dismiss', this.snackBarConfig);
          }, 500);
        });
        contentItemObservables.push(contentItem$);
      }
    }
  }

  unloadContentViewComponent() {
    if (this.contentViewDirective) {
      const viewContainerRef = this.contentViewDirective.viewContainerRef;
      if (viewContainerRef) {
        viewContainerRef.clear();
      }
    }
  }

  private createForm(): FormGroup {
    const form = this.fb.group({});
    return form;
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  buttonPress(button) {
    this[button.command]();
  }

  deleteItem() {
    this.snackBar.open('Item deleted (not really)!', 'Hide');
  }

  publishItem() {
    this.snackBar.open('Item published (not really)!', 'Hide');
  }
}
