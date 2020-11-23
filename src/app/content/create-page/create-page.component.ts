import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { Config } from '../../core/shared/model/config';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ContentItem } from '../shared/model/content-item';
import { User } from '../../user/shared/user';
import { UserService } from '../../user/shared/user.service';
import { ContentViewComponent } from '../content-view/content-view.component';
import { DynamicComponentDirective } from '../shared/directive/dynamic-component.directive';
import { ContentObject } from '../shared/model/content-object';
import { ContentObjectListComponent } from '../content-object-list/content-object-list.component';
import { FileUploadComponent } from '../../shared/widgets/file-upload/file-upload.component';
import { NotificationService } from '../../shared/providers/notification.service';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { takeUntil } from 'rxjs/operators';
import { ComponentCanDeactivateDirective } from '../../routing/shared/component-can-deactivate.directive';
import { DefaultAutoFocusNavigationState } from '../../shared/shared/auto-focus-navigation-state';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.css'],
})
export class CreatePageComponent extends ComponentCanDeactivateDirective implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  private user: User;

  config: Config;
  contentItem: ContentItem;
  contentObject: ContentObject;
  pageConfig: ContentPageConfig;
  form: FormGroup;
  previewing: boolean;
  submitPending: boolean;

  @ViewChild(DynamicComponentDirective) contentViewDirective: DynamicComponentDirective;
  @ViewChild(ContentViewComponent, { static: true }) contentViewComponent: ContentViewComponent;
  @ViewChild(ContentObjectListComponent, { static: true }) contentObjectListComponent: ContentObjectListComponent;
  @ViewChildren(FileUploadComponent) fileUploads: QueryList<FileUploadComponent>;

  /**
   * Getter so that template can bind to the default navigation state.
   */
  get autoFocusNavigationState() {
    return DefaultAutoFocusNavigationState;
  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router,
    private route: ActivatedRoute,
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
      if (this.contentObjectListComponent) {
        this.contentObjectListComponent.reset();
      }
      if (this.contentViewComponent) {
        this.contentViewComponent.reset();
      }
      this.contentObject = undefined;
      this.extractPageConfig();
    });
  }

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

    if (this.fileUploads && this.fileUploads.length > 0) {
      this.fileUploads.first.focus();
    }

    return index;
  }

  cancel() {
    this.router.navigate([this.config.tenant], { state: DefaultAutoFocusNavigationState });
  }

  hasError(contentObject: ContentObject): boolean {
    return contentObject.failed;
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

  private saveItemAndReset(): void {
    this.saveItemInternal().then(() => {
      if (this.fileUploads) {
        this.fileUploads.forEach((fileUpload) => fileUpload.reset());
      }

      if (this.contentObjectListComponent) {
        this.contentObjectListComponent.reset();
      }
    });
  }

  private saveItem(): void {
    this.saveItemInternal().then(() => {
      this.router.navigate([this.config.tenant], { state: DefaultAutoFocusNavigationState });
    });
  }

  private saveItemInternal(): Promise<any> {
    const fields = this.pageConfig.fieldsToDisplay;
    const formModel = this.form.value;
    const metadataOverrides = this.pageConfig.onSave;

    if (!this.form.valid) {
      const invalidFields = <FormControl[]>Object.keys(this.form.controls)
        .map((key) => this.form.controls[key])
        .filter((ctl) => ctl.invalid);
      if (invalidFields.length > 0) {
        const invalidElem: any = invalidFields[0];
        invalidElem.nativeElement.focus();
      }
      this.notificationService.error('Invalid Form');
    } else if (!this.contentObjectListComponent.hasContentObjects()) {
      this.notificationService.error('No file attached');
    } else {
      const saveResult = this.contentObjectListComponent.saveItem(fields, formModel, metadataOverrides);

      if (saveResult) {
        return saveResult.then((successfulSave) => {
          if (successfulSave) {
            this.form.markAsPristine(); // the entire form has saved and is no longer dirty
            return Promise.resolve();
          } else {
            return Promise.reject();
          }
        });
      }
    }

    return Promise.reject();
  }

  private createForm(): FormGroup {
    const form = this.fb.group({});
    return form;
  }

  private extractPageConfig() {
    const config = this.config;
    if (!isNullOrUndefined(config)) {
      this.pageConfig = config.pages['create'];
      if (!isNullOrUndefined(this.pageConfig)) {
        this.titleService.setTitle(this.pageConfig.pageName);
      }
    }
  }

  reset() {
    this.form.reset();
  }

  buttonPress(button) {
    this[button.command]();
  }

  public canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
