import { isNullOrUndefined } from 'util';

export class ContentItem {
  public id: string;
  public label: string;
  public metadata: Map<string, any> = new Map();

  constructor(contentItem?: ContentItem) {
    if (!isNullOrUndefined(contentItem)) {
      this.id = contentItem.id;
      this.label = contentItem.label;
      this.metadata = Object.assign({}, contentItem.metadata); // deep copy metadata
    }
  }
}
