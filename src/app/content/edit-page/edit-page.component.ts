import { takeUntil } from 'rxjs/operators';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { ActivatedRoute } from '@angular/router';

import { ContentService } from '../shared/content.service';
import { Config } from '../../core/shared/model/config';
import { Title } from '@angular/platform-browser';

import { Subject } from 'rxjs';
import { ContentItem } from '../shared/model/content-item';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { ContentViewComponent } from '../content-view/content-view.component';
import { User } from '../../user/shared/user';
import { DynamicComponentDirective } from '../shared/directive/dynamic-component.directive';
import { UserService } from '../../user/shared/user.service';
import { ContentObject } from '../shared/model/content-object';
import { ContentObjectListComponent } from '../content-object-list/content-object-list.component';
import { NotificationService } from '../../shared/providers/notification.service';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { ComponentCanDeactivate } from '../../routing/shared/component-can-deactivate';
import { ContentMetadataComponent } from '../content-metadata/content-metadata.component';
import { FileUploadComponent } from '../../shared/widgets/file-upload/file-upload.component';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css'],
})
export class EditPageComponent extends ComponentCanDeactivate implements OnInit, OnDestroy, AfterViewInit {
  private componentDestroyed = new Subject();
  private user: User;

  config: Config;
  contentItem: ContentItem;
  contentObject: ContentObject;
  pageConfig: ContentPageConfig;
  form: FormGroup;

  id: string;
  previewing: boolean;
  submitPending: boolean;

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
  ) {
    super();
  }

  ngOnInit() {
    this.user = this.userService.getUser();
    this.form = this.createForm();
    this.route.data.pipe(takeUntil(this.componentDestroyed)).subscribe((data: { config: Config }) => {
      this.config = data.config;
      this.extractPageConfig();
    });
    this.route.paramMap.pipe(takeUntil(this.componentDestroyed)).subscribe((params) => {
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
          .pipe(takeUntil(this.componentDestroyed))
          .subscribe(
            (contentItem) => {
              console.log('Loaded content item: ' + contentItem.id);
              this.contentItem = contentItem;
            },
            (err) => {
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

  updateSavingStatus(inProgress: boolean) {
    this.submitPending = inProgress;
  }

  saveItem() {
    const fields = this.pageConfig.fieldsToDisplay;
    const formModel = this.form.value;
    const metadataOverrides = this.pageConfig.onSave;

    if (this.form.valid) {
      const saveResult = this.contentObjectListComponent.saveItem(fields, formModel, metadataOverrides);
      if (saveResult) {
        saveResult.then((successfulSave) => {
          if (successfulSave) {
            this.form.markAsPristine(); // the entire form has saved and is no longer dirty
          }
        });
      }
    } else {
      const invalidFields = <FormControl[]>Object.keys(this.form.controls)
        .map((key) => this.form.controls[key])
        .filter((ctl) => ctl.invalid);
      if (invalidFields.length > 0) {
        const invalidElem: any = invalidFields[0];
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

  public canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
