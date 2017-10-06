import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { ContentItem } from '../shared/model/content-item';
import { isNullOrUndefined } from 'util';
import { Subject } from 'rxjs/Subject';
import { ContentService } from '../shared/content.service';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  private defaultUrl: string;
  private defaultItemType: string;

  url: SafeUrl;
  item: ContentItem;
  dataType: string;
  pdfDataSource: Object; // ng2-pdf-preview does not accept DataUrl

  @Input() item$: Observable<ContentItem>;
  @Input() file$: Observable<File>;

  pageNumber: number;

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.pageNumber = 1;

    this.file$.takeUntil(this.componentDestroyed).subscribe((file: File) => {
      if (!isNullOrUndefined(file)) {
        this.displayFilePreview(file);
      } else {
        this.displayDefaultUrl();
      }
    });

    this.item$.takeUntil(this.componentDestroyed).subscribe((contentItem: ContentItem) => {
      this.item = contentItem;
      this.defaultUrl = this.contentService.getFileUrl(this.item.id, true);
      this.displayDefaultUrl();
    });
  }

  private displayDefaultUrl(): void {
    this.url = this.defaultUrl;
    this.determineItemType();
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
    this.defaultItemType = this.dataType;
  }

  private displayFilePreview(file: File) {
    const mimeType = file.type;
    const reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    if (mimeType === 'application/pdf') {
      reader.readAsArrayBuffer(file); // ng2-pdf-preview does not accept DataUrl
    } else {
      reader.readAsDataURL(file);
    }
  }

  private _handleReaderLoaded(e) {
    const reader = e.target;
    const data = reader.result;

    if (data instanceof ArrayBuffer) {
      this.url = '';
      this.pdfDataSource = { data: data };
    } else {
      this.pdfDataSource = null;
      this.url = data;
    }
    this.determineUrlType();
  }

  // TODO: type detection should be improved
  determineUrlType(): void {
    const url = this.url.toString();
    if (!isNullOrUndefined(this.pdfDataSource)) {
      this.dataType = 'pdfData';
    } else if (url.startsWith('http')) {
      this.dataType = this.defaultItemType;
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
