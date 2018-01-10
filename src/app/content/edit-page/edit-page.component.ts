import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { ActivatedRoute } from '@angular/router';

import { ContentService } from '../shared/content.service';
import { Config } from '../../core/shared/model/config';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { ContentItem } from '../shared/model/content-item';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import 'rxjs/add/observable/of';
import { MatSnackBar } from '@angular/material';
import { ContentViewComponent } from '../content-view/content-view.component';
import { User } from '../../user/shared/user';
import { DynamicComponentDirective } from '../shared/directive/dynamic-component.directive';
import { UserService } from '../../user/shared/user.service';
import { ContentObject } from '../shared/model/content-object';
import { ContentObjectListComponent } from '../content-object-list/content-object-list.component';
import { isNullOrUndefined } from 'util';
import { NotificationService } from '../../shared/providers/notification.service';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private componentDestroyed = new Subject();
  private user: User;

  config: Config;
  contentItem: ContentItem;
  contentObject: ContentObject;
  pageConfig: ContentPageConfig;
  form: FormGroup;

  id: string;
  previewing: boolean;

  @ViewChild(DynamicComponentDirective) contentViewDirective: DynamicComponentDirective;
  @ViewChild(ContentViewComponent) contentViewComponent: ContentViewComponent;
  @ViewChild(ContentObjectListComponent) contentObjectListComponent: ContentObjectListComponent;

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private titleService: Title,
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.user = this.userService.getUser();
    this.form = this.createForm();
    this.route.data.takeUntil(this.componentDestroyed).subscribe((data: { config: Config }) => {
      this.config = data.config;
      this.extractPageConfig();
    });
    this.route.paramMap.takeUntil(this.componentDestroyed).subscribe(params => {
      this.id = params.get('id');
      if (this.contentObjectListComponent) {
        this.contentObjectListComponent.reset();
      }
      if (this.contentViewComponent) {
        this.contentViewComponent.reset();
      }
      this.contentObject = undefined;
      this.extractPageConfig();
      if (this.id) {
        this.contentService
          .read(this.id)
          .takeUntil(this.componentDestroyed)
          .subscribe(
            contentItem => {
              console.log('Loaded content item: ' + contentItem.id);
              this.contentItem = contentItem;
            },
            err => {
              const message = 'There was an error retrieving the content item:' + err.statusText;
              this.snackBar.open(message, 'Dismiss');
            }
          );
      }
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  addFile(file: File) {
    console.log('Added file');
    const index = this.contentObjectListComponent.addFile(file);
    if (index === 0) {
      this.contentObjectListComponent.selectObject(index);
    }
    return index;
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

  removeFile(index: number) {
    console.log('Removed file');
    this.contentObjectListComponent.removeContentObject(index);
  }

  selectObject(contentObject: ContentObject) {
    if (contentObject) {
      contentObject.loaded$.subscribe(() => {
        this.contentObject = contentObject;
        this.previewing = true;
      });
    } else {
      this.contentObject = undefined;
      this.previewing = false;
    }
  }

  saveItem() {
    const fields = this.pageConfig.fieldsToDisplay;
    const formModel = this.form.value;
    const metadataOverrides = this.pageConfig.onSave;

    if (this.form.valid) {
      this.contentObjectListComponent.saveItem(fields, formModel, metadataOverrides);
    } else {
      const invalid = <FormControl[]>Object.keys(this.form.controls)
        .map(key => this.form.controls[key])
        .filter(ctl => ctl.invalid);
      if (invalid.length > 0) {
        const invalidElem: any = invalid[0];
        invalidElem.nativeElement.focus();
      }
      this.notificationService.error('Invalid Form');
    }
  }

  private createForm(): FormGroup {
    const form = this.fb.group({});
    return form;
  }

  private extractPageConfig() {
    const config = this.config;

    if (!isNullOrUndefined(config)) {
      this.pageConfig = config.pages['edit'];
      if (!isNullOrUndefined(this.pageConfig)) {
        this.titleService.setTitle(this.pageConfig.pageName);
      }
    }
  }
}
