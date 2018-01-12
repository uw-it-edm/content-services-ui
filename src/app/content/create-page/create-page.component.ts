import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { Config } from '../../core/shared/model/config';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ContentItem } from '../shared/model/content-item';
import { User } from '../../user/shared/user';
import { UserService } from '../../user/shared/user.service';
import { ContentViewComponent } from '../content-view/content-view.component';
import { DynamicComponentDirective } from '../shared/directive/dynamic-component.directive';
import { ContentObject } from '../shared/model/content-object';
import { ContentObjectListComponent } from '../content-object-list/content-object-list.component';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.css']
})
export class CreatePageComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  private user: User;

  config: Config;
  contentItem: ContentItem;
  contentObject: ContentObject;
  pageConfig: ContentPageConfig;
  form: FormGroup;
  previewing: boolean;

  @ViewChild(DynamicComponentDirective) contentViewDirective: DynamicComponentDirective;
  @ViewChild(ContentViewComponent) contentViewComponent: ContentViewComponent;
  @ViewChild(ContentObjectListComponent) contentObjectListComponent: ContentObjectListComponent;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.userService.getUser();
    this.form = this.createForm();
    this.route.data.takeUntil(this.componentDestroyed).subscribe((data: { config: Config }) => {
      this.config = data.config;
      this.extractPageConfig();
    });
    this.route.paramMap.takeUntil(this.componentDestroyed).subscribe(params => {
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
    return index;
  }

  cancel() {
    this.router.navigate([this.config.tenant]);
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

  saveItem() {
    const fields = this.pageConfig.fieldsToDisplay;
    const formModel = this.form.value;
    const metadataOverrides = this.pageConfig.onSave;

    this.contentObjectListComponent.saveItem(fields, formModel, metadataOverrides);
  }

  private createForm(): FormGroup {
    const form = this.fb.group({});
    if (this.pageConfig && this.pageConfig.uploadAnother) {
      form.addControl('uploadAnother', new FormControl());
    }
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
    this.setDefaults();
  }

  private setDefaults() {
    if (this.pageConfig && this.pageConfig.uploadAnother) {
      const ctrl = this.form.get('uploadAnother');
      if (ctrl) {
        ctrl.patchValue(this.pageConfig.uploadAnother);
      }
    }
  }

  reset() {
    this.form.reset();
    this.setDefaults();
  }

  buttonPress(button) {
    this[button.command]();
  }
}
