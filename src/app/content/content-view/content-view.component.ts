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
  dataType: string;
  srcObj: Object;

  @Input() item$: Observable<ContentItem>;
  @Input() data$: Observable<any>;

  pageNumber: number;

  constructor() {}

  ngOnInit() {
    this.pageNumber = 1;

    this.item$.takeUntil(this.componentDestroyed).subscribe(inputItem => {
      this.item = inputItem;
      this.determineItemType();
    });
    this.data$.takeUntil(this.componentDestroyed).subscribe(data => {
      if (data instanceof ArrayBuffer) {
        this.srcObj = { data: data };
        this.dataType = 'pdfData';
      } else {
        this.url = data;
        this.determineUrlType();
      }
    });
  }

  // TODO: type detection should be improved
  private determineItemType(): void {
    if (!isNullOrUndefined(this.item)) {
      // const webExtension = this.item.metadata['WebExtension'];
      const mimeType = this.item.metadata['MimeType'];
      if (mimeType && mimeType === 'application/pdf') {
        this.dataType = 'pdfUrl';
      } else if (mimeType && mimeType.startsWith('image')) {
        this.dataType = 'image';
      } else {
        this.dataType = 'unknown';
      }
    } else {
      this.dataType = 'unknown';
    }
  }

  // TODO: type detection should be improved
  private determineUrlType(): void {
    const url = this.url.toString();
    if (url.startsWith('http')) {
      this.determineItemType();
    } else if (url.startsWith('data:image')) {
      this.dataType = 'image';
    } else if (url.startsWith('data:application/pdf')) {
      this.dataType = 'pdf';
    } else {
      this.dataType = 'unknown';
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
