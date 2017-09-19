import { isNullOrUndefined } from 'util';
import * as _ from 'lodash';

export class ContentItem {
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
