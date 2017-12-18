import { ContentItem } from './content-item';
import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';

export class ContentItemChange {
  private item: ContentItem;
  private file: File;
  private operation: Observable<ContentItem>;
  public done: boolean;
  public saved: boolean;

  public item$ = new ReplaySubject<ContentItem>();
  public file$ = new ReplaySubject<File>();

  constructor(item: ContentItem, file: File) {
    this.item = item;
    this.file = file;
    if (file === null) {
      this.saved = true;
    }
    this.item$.next(item);
    this.file$.next(file);
  }

  public getFile() {
    return this.file;
  }

  public setFile(file: File) {
    this.file = file;
    this.file$.next(file);
    this.saved = false;
  }

  public getItem() {
    return this.item;
  }

  public setItem(item: ContentItem) {
    this.item = item;
    this.item$.next(item);
  }

  public getLabel() {
    if (this.done) {
      return this.item.metadata['OriginalFileName'];
    }
    if (!isNullOrUndefined(this.file)) {
      return this.file.name;
    }
    return this.item.label;
  }

  public getOperation(): Observable<ContentItem> {
    return this.operation;
  }

  public setOperation(operation: Observable<ContentItem>) {
    this.operation = operation;
    this.operation.subscribe(
      item => {
        this.item$.next(item);
        this.done = true;
      },
      () => {
        this.done = true;
      }
    );
  }
}
