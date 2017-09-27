import { Component, Input, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { ContentItem } from '../shared/model/content-item';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit {
  url: SafeUrl;
  item: ContentItem;
  isPdf = false;
  @Input() item$: Observable<ContentItem>;
  @Input() url$: Observable<string>;

  pageNumber: number;

  constructor() {}

  ngOnInit() {
    this.pageNumber = 1;
    this.url$.subscribe(inputUrl => {
      this.url = inputUrl;
    });
    this.item$.subscribe(inputItem => {
      this.item = inputItem;
      this.isPdf = this.isPdfItem(this.item);
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
}
