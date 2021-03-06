import { first, takeUntil } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ContentObject } from '../shared/model/content-object';
import { FormGroup } from '@angular/forms';
import { ContentItem } from '../shared/model/content-item';
import { ContentService, FileUrlParameters } from '../shared/content.service';
import { Field } from '../../core/shared/model/field';
import { Config } from '../../core/shared/model/config';
import { User } from '../../user/shared/user';
import { Subject } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../user/shared/user.service';
import { NotificationService } from '../../shared/providers/notification.service';
import { CustomTextUtilities } from '../../shared/directives/custom-text/custom-text-utilities';

@Component({
  selector: 'app-content-object-list',
  templateUrl: './content-object-list.component.html',
  styleUrls: ['./content-object-list.component.css'],
})
export class ContentObjectListComponent implements OnInit, OnChanges, OnDestroy {
  private componentDestroyed = new Subject();

  @Input() contentItem: ContentItem;
  @Input() formGroup: FormGroup;
  @Input() page: string;
  @Input() disableFileReplace: boolean;

  @Output() remove = new EventEmitter<number>();
  @Output() select = new EventEmitter<ContentObject>(true);
  @Output() saving = new EventEmitter<boolean>();

  config: Config;
  contentObjects = new Array<ContentObject>();
  createdItems = new Array<ContentItem>();
  updatedItems = new Array<ContentItem>();
  failures = new Array<any>();

  snackBarTimeout: any;
  selectedIndex = -1;
  user: User;

  constructor(
    private contentService: ContentService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();

    this.route.paramMap.pipe(takeUntil(this.componentDestroyed)).subscribe((params) => {
      this.route.data.pipe(takeUntil(this.componentDestroyed)).subscribe((data: { config: Config }) => {
        this.config = data.config;
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.contentItem && changes.contentItem.currentValue) {
      const index = this.addItem(changes.contentItem.currentValue);
      if (index === 0) {
        this.selectObject(index);
      }
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  public addFile(file: File): number {
    const contentObject = new ContentObject(null, file);
    this.decorateContentObject(contentObject);
    const index = this.contentObjects.push(contentObject);
    return index - 1;
  }

  public addItem(item: ContentItem): number {
    const contentObject = new ContentObject(item, null);
    this.decorateContentObject(contentObject);
    const index = this.contentObjects.push(contentObject);
    return index - 1;
  }

  public removeContentObject(index: number) {
    // If this content object exists on the server but has been hidden
    // by a local file, then don't remove the content object from the transaction;
    // instead, get rid of the file
    const contentObject = this.contentObjects[index];
    if (contentObject.item && contentObject.file) {
      contentObject.removeFile();
    } else {
      this.contentObjects.splice(index, 1);
      let previousContentObject = null;
      if (this.selectedIndex === index) {
        this.selectedIndex--;
        if (this.selectedIndex > 0 && this.contentObjects.length > this.selectedIndex) {
          previousContentObject = this.contentObjects[this.selectedIndex];
        }
      }
      this.select.next(previousContentObject);
    }
  }

  public reset() {
    this.contentObjects = new Array<ContentObject>();
    this.selectedIndex = -1;
    this.createdItems = new Array<ContentItem>();
    this.updatedItems = new Array<ContentItem>();
    this.failures = new Array<any>();
    this.select.next(null);
  }

  public selectObject(index: number) {
    if (this.selectedIndex !== index) {
      const contentObject = this.contentObjects[index];
      this.select.next(contentObject);
      this.selectedIndex = index;
    }
  }

  public prepareItem(
    sourceItem: ContentItem,
    fields: Array<Field>,
    formModel: any,
    config?: Config,
    user?: User,
    metadataOverrides?: Array<any>
  ) {
    const metadataDefaults = new Array<any>();
    if (config && config.contentConfig) {
      if (config.contentConfig.profile) {
        metadataDefaults.push({ name: 'ProfileId', value: config.contentConfig.profile });
      }
      if (config.contentConfig.account) {
        const userName = user.actAs ? user.actAs : user.userName;
        metadataDefaults.push({ name: 'Account', value: config.contentConfig.account.replace('${user}', userName) });
      }
    }

    const item = new ContentItem(sourceItem);
    this.applyFormValues(item, fields, formModel, metadataDefaults, metadataOverrides);
    return item;
  }

  protected applyFormValues(
    item: ContentItem,
    fields: Array<Field>,
    formModel: any,
    metadataDefaults?: Array<any>,
    metadataOverrides?: Array<any>
  ) {
    if (metadataDefaults) {
      metadataDefaults.map((entry) => {
        item.metadata[entry.name] = entry.value;
      });
    }
    if (fields) {
      fields.map((field) => {
        if (formModel.metadata) {
          let value = formModel.metadata[field.key];
          if (value !== null && value === '') {
            value = null;
          }
          item.metadata[field.key] = value;
        }
      });
    }
    if (metadataOverrides) {
      metadataOverrides.map((entry) => {
        item.metadata[entry.name] = entry.value;
      });
    }
  }

  /**
   * Displays a notification with a message built from the current state of this component,
   * returns a promise that resolves once the notification has been displayed.
   */
  private notify(): Promise<boolean> {
    if (this.snackBarTimeout) {
      clearTimeout(this.snackBarTimeout);
      this.snackBarTimeout = null;
    }

    return new Promise((resolve) => {
      this.snackBarTimeout = setTimeout(() => {
        const snackBarRef = this.createSnackBar();

        snackBarRef.afterOpened().subscribe(() => {
          resolve();
        });
      }, 500);
    });
  }

  private createSnackBar(): MatSnackBarRef<SimpleSnackBar> {
    const message = this.createUpdateSnackBarMessage();
    const snackBarConfig = new MatSnackBarConfig();
    snackBarConfig.politeness = 'assertive';
    snackBarConfig.panelClass = 'cs-wrap-lines';

    if (this.failures.length === 0) {
      snackBarConfig.duration = 5000;
    }

    return this.snackBar.open(message, 'Dismiss', snackBarConfig);
  }

  private createUpdateSnackBarMessage(): string {
    const numberOfCreatedItems = this.createdItems.length;
    const numberOfUpdatedItems = this.updatedItems.length;
    const numberOfFailures = this.failures.length;

    const numberOfSavedItems = numberOfCreatedItems + numberOfUpdatedItems;

    let message = numberOfSavedItems + ' items saved';
    if (numberOfCreatedItems === 1) {
      const item = this.createdItems[0];
      message = 'Saved item ' + item.id;
    } else if (numberOfUpdatedItems === 1) {
      const item = this.updatedItems[0];
      message = 'Saved item ' + item.id;
    }

    if (numberOfFailures > 0) {
      if (numberOfSavedItems) {
        message = numberOfSavedItems + ' saved and ' + numberOfFailures + ' failed';
      } else {
        message = 'Failed to save ' + numberOfFailures + ' item' + (numberOfFailures > 1 ? 's' : '');
      }

      this.failures.forEach((failure) => {
        const customText = CustomTextUtilities.getCustomText(
          this.config.customText,
          'error.content.update.' + failure.status,
          failure.message
        );
        if (customText.isCustom) {
          message += '\n' + customText.label;
        }
      });
    }

    return message;
  }

  onDisplayType(contentObject: ContentObject, displayType: string) {
    console.log('Received display type of ' + displayType);
    if (contentObject.itemId) {
      contentObject.setUrl(this.buildUrl({ itemId: contentObject.itemId }));
      console.log('Content object url is ' + contentObject.url);
    }
  }

  removeObject(contentObject: ContentObject, index: number) {
    this.remove.emit(index);
  }

  replace(contentObject: ContentObject, file: File) {
    // Replace can only be performed on a persisted content item
    if (contentObject.item) {
      console.log('Replaced file for ' + contentObject.item.id);
      contentObject.setFile(file);
    }
  }

  saveItem(fields: Array<Field>, formModel: any, metadataOverrides: Array<any>): Promise<boolean> {
    const contentItemPromises = new Array<Promise<ContentItem>>();

    if (this.contentObjects) {
      this.createdItems = new Array<ContentItem>();
      this.updatedItems = new Array<ContentItem>();
      this.failures = new Array<any>();
      this.saving.emit(true); // saving item in progressing

      for (const contentObject of this.contentObjects) {
        const contentItem = this.prepareItem(contentObject.item, fields, formModel, this.config, this.user, metadataOverrides);
        let contentItem$;
        if (contentObject.item) {
          contentItem$ = this.contentService.update(contentItem, contentObject.getFile());
        } else {
          contentItem$ = this.contentService.create(contentItem, contentObject.getFile());
        }

        if (contentItem$) {
          const contentItemSaving = contentItem$
            .pipe(first())
            .toPromise()
            .then((item) => {
              contentObject.removeFile();
              contentObject.onLoad(item);
              contentObject.failed = false;
              this.updateComponentSavedItemLists(item);
              this.saving.emit(false); // item saving completed
            })
            .catch((err) => {
              this.failures.push(err);
              contentObject.failed = true;
              this.saving.emit(false); // item saving failed

              throw err;
            });
          contentItemPromises.push(contentItemSaving);
        }
      }
    }

    // when all documents have saved successfully, or short circuit and return false if there are any failures
    return Promise.all(contentItemPromises)
      .then(() => {
        return this.notify().then(() => true);
      })
      .catch(() => {
        this.notify();
        return false;
      });
  }

  hasContentObjects() {
    return this.contentObjects && this.contentObjects.length > 0;
  }

  private updateComponentSavedItemLists(item: ContentItem) {
    // if item already exists return its index, otherwise return -1
    const existingIndex = this.createdItems.findIndex((element: ContentItem) => {
      return element.id === item.id;
    });

    if (existingIndex === -1) {
      console.log('Item Created: ' + item.id);
      this.createdItems.push(item);
    } else {
      console.log('Item Updated: ' + item.id);
      this.updatedItems.push(item);
    }
  }

  private decorateContentObject(contentObject: ContentObject) {
    if (contentObject) {
      contentObject.displayType$.subscribe((displayType) => {
        this.onDisplayType(contentObject, displayType);
      });
    }
  }

  private buildUrl({ itemId, webViewable = true, useOriginalFilename = true, disposition }: FileUrlParameters) {
    return this.contentService.getFileUrl({
      itemId: itemId,
      webViewable: webViewable,
      useOriginalFilename: useOriginalFilename,
      disposition: disposition,
    });
  }
}
