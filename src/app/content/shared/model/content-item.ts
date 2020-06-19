import { isNullOrUndefined } from '../../../core/util/node-utilities';
import * as _ from 'lodash';

export interface IContentItem {
  id: string;
  label?: string;
  metadata: { [key: string]: any };
}

export class ContentItem implements IContentItem {
  public id: string;
  public label: string;
  public metadata: Map<string, any> = new Map();

  constructor(contentItem?: ContentItem) {
    if (!isNullOrUndefined(contentItem)) {
      this.id = contentItem.id;
      this.label = contentItem.label;
      this.metadata = _.cloneDeep(contentItem.metadata); // deep copy nested metadata
    }
  }
}
