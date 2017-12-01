import { ContentItem } from './content-item';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Field } from '../../../core/shared/model/field';
import { ContentObject } from './content-object';
import { ContentService } from '../content.service';
import { Config } from '../../../core/shared/model/config';
import { User } from '../../../user/shared/user';

export class ContentItemTransaction {
  public contentObjects = new Array<ContentObject>();
  public selectedContentObject$: Subject<ContentObject> = new BehaviorSubject(null);
  public selectedIndex = -1;

  constructor(private contentService: ContentService) {}

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
      this.selectedContentObject$.next(previousContentObject);
    }
  }

  public reset() {
    this.contentObjects = new Array<ContentObject>();
  }

  public selectObject(index: number) {
    if (this.selectedIndex !== index) {
      const contentObject = this.contentObjects[index];
      this.selectedContentObject$.next(contentObject);
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
    if (config) {
      if (config.profile) {
        metadataDefaults.push({ name: 'ProfileId', value: config.profile });
      }
      if (config.account) {
        const userName = user.actAs ? user.actAs : user.userName;
        metadataDefaults.push({ name: 'Account', value: config.account.replace('${user}', userName) });
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
      metadataDefaults.map(entry => {
        item.metadata[entry.name] = entry.value;
      });
    }
    fields.map(field => {
      let value = formModel.metadata[field.name];
      if (value !== null && value === '') {
        value = null;
      }
      item.metadata[field.name] = value;
    });
    if (metadataOverrides) {
      metadataOverrides.map(entry => {
        item.metadata[entry.name] = entry.value;
      });
    }
  }

  onDisplayType(contentObject: ContentObject, displayType: string) {
    console.log('Received display type of ' + displayType);
    if (contentObject.itemId) {
      contentObject.setUrl(this.buildUrl(contentObject.itemId));
      console.log('Content object url is ' + contentObject.url);
    }
  }

  private decorateContentObject(contentObject: ContentObject) {
    if (contentObject) {
      contentObject.displayType$.subscribe(displayType => {
        this.onDisplayType(contentObject, displayType);
      });
    }
  }

  private buildUrl(id: string, isWebViewable = true, disposition?: string) {
    return this.contentService.getFileUrl(id, isWebViewable, disposition);
  }
}
