import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { ContentItem } from '../shared/model/content-item';
import { isNullOrUndefined } from 'util';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  url: SafeUrl;
  item: ContentItem;
  isPdf = false;
  @Input() item$: Observable<ContentItem>;
  @Input() url$: Observable<string>;

  pageNumber: number;

  constructor() {}

  ngOnInit() {
    this.pageNumber = 1;
    this.url$.takeUntil(this.componentDestroyed).subscribe(inputUrl => {
      this.url = inputUrl;
      this.isPdf = false; // TODO: pdf detection needs to be improved
    });
    this.item$.takeUntil(this.componentDestroyed).subscribe(inputItem => {
      this.item = inputItem;
      this.isPdf = this.isPdfItem(this.item); // TODO: pdf detection needs to be improved
    });
  }

  private isPdfItem(item: ContentItem) {
    let isPdfItem = false;
    if (!isNullOrUndefined(item)) {
      const webExtension = item.metadata['WebExtension'];
      isPdfItem = webExtension && webExtension === 'pdf';
    }
    return isPdfItem;
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
