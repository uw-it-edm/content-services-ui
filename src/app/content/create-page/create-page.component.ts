import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { Config } from '../../core/shared/model/config';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ContentService } from '../shared/content.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ContentItem } from '../shared/model/content-item';
import { User } from '../../user/shared/user';
import { UserService } from '../../user/shared/user.service';
import { ContentItemTransaction } from '../shared/model/content-item-transaction';
import { ContentViewComponent } from '../content-view/content-view.component';
import { DynamicComponentDirective } from '../shared/directive/dynamic-component.directive';
import { ContentObject } from '../shared/model/content-object';
import { Observable } from 'rxjs/Observable';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.css']
})
export class CreatePageComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  private user: User;

  config: Config;
  pageConfig: ContentPageConfig;
  form: FormGroup;
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
    private router: Router,
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

      this.route.data.takeUntil(this.componentDestroyed).subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()].createPageConfig;
        this.titleService.setTitle(this.pageConfig.pageName);
        this.setDefaults();
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
    return index;
  }

  removeFile(index: number) {
    console.log('Removed file');
    this.transaction.removeContentObject(index);
  }

  cancel() {
    this.router.navigate([this.config.tenant + '/' + this.page]);
  }

  loadContentViewComponent(contentObject: ContentObject) {
    if (!this.contentViewComponent) {
      console.log('Loading content view component');
      if (this.componentFactoryResolver) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ContentViewComponent);

        if (this.contentViewDirective) {
          const viewContainerRef = this.contentViewDirective.viewContainerRef;
          viewContainerRef.clear();

          const componentRef = viewContainerRef.createComponent(componentFactory);
          this.contentViewComponent = <ContentViewComponent>componentRef.instance;
        }
      }
    }
    if (this.contentViewComponent) {
      this.contentViewComponent.onContentObjectChanged(contentObject);
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
    const metadataOverrides = this.pageConfig.onSave;
    const transaction = this.transaction;
    const contentItemObservables = new Array<Observable<ContentItem>>();
    const contentObjects = transaction.contentObjects;

    if (contentObjects) {
      const numberOfContentObjects = contentObjects.length;
      for (const contentObject of contentObjects) {
        const contentItem = this.transaction.prepareItem(
          contentObject.item,
          fields,
          formModel,
          this.config,
          this.user,
          metadataOverrides
        );
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
          contentObject.onLoad(item);

          if (existingIndex === -1) {
            console.log('Item Created: ' + item.id);
            this.contentItems.push(item);
          }

          if (this.snackBarTimeout) {
            clearTimeout(this.snackBarTimeout);
            this.snackBarTimeout = null;
          }
          this.snackBarTimeout = setTimeout(() => {
            const numberOfItems = this.contentItems.length;
            const message = numberOfItems + ' items created';
            const snackBarRef = this.snackBar.open(message, 'Dismiss', this.snackBarConfig);

            snackBarRef.onAction().subscribe(() => {
              if (this.form.get('uploadAnother').value) {
                this.reset();
              } else {
                this.router.navigate([this.config.tenant + '/' + this.page]);
              }
            });
          }, 500);
        });
        contentItemObservables.push(contentItem$);
      }
    }
  }

  unloadContentViewComponent() {
    console.log('Unloading content view component');
    if (this.contentViewDirective) {
      const viewContainerRef = this.contentViewDirective.viewContainerRef;
      if (viewContainerRef) {
        viewContainerRef.clear();
      }
    }
    this.contentViewComponent = null;
  }

  private createForm(): FormGroup {
    const form = this.fb.group({});
    // form.addControl('uploadAnother', new FormControl());
    return form;
  }

  private setDefaults() {
    // this.form.get('uploadAnother').patchValue(this.pageConfig.uploadAnother);
  }

  reset() {
    this.form.reset();
    this.setDefaults();
  }

  buttonPress(button) {
    this[button.command]();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
