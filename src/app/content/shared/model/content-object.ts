import { ContentItem } from './content-item';
import { isNullOrUndefined } from 'util';
import { ReplaySubject } from 'rxjs/ReplaySubject';

export class ContentObject {
  public contentLength: number;
  public contentType: string;
  public displayType;
  public displayType$ = new ReplaySubject<string>(); // 'blank', 'pdfData', 'pdfUrl', 'image', 'unknown-dataURI', 'unknown'
  public file: File;
  public itemId: string;
  public item: ContentItem;
  public loaded$ = new ReplaySubject<boolean>();
  public persisted: boolean;
  public failed: boolean;
  public pdfDataSource: Object;
  public text: any;
  public url;

  private defaultDisplayType;
  private originalFileName;
  private reader;

  constructor(item?: ContentItem, file?: File) {
    if (item) {
      this.onLoad(item);
    }
    if (file) {
      this.setFile(file);
    }
  }

  static coerceToNumber(value: any): number {
    if (ContentObject.isNumber(value)) {
      return value;
    }
    return parseInt(value, 10);
  }

  static isNumber(o) {
    return !isNaN(o - 0) && o !== null && o !== '' && o !== false;
  }

  public getOriginalFileName() {
    return this.originalFileName;
  }

  public onLoad(item: ContentItem) {
    this.item = item;
    this.itemId = item.id;
    this.contentType = item.metadata['WebExtension'];
    this.contentLength = ContentObject.coerceToNumber(item.metadata['FileSize']);
    this.originalFileName = item.metadata['OriginalFileName'];
    this.persisted = true;
    this.determineDisplayType();
  }

  public onSelected() {
    if (this.file && this.url == null) {
      this.displayFilePreview(this.file);
    }
  }

  public removeFile() {
    if (this.item) {
      this.file = null;
      this.onLoad(this.item);
    }
  }

  public setFile(file: File) {
    this.file = file;
    this.originalFileName = file.name;
    this.contentLength = file.size;
    this.contentType = file.type;
    this.displayFilePreview(file);
    this.persisted = false;
  }

  private determineDisplayType(): string {
    let displayType = 'blank';
    if (this.contentType && this.contentType !== null) {
      if (this.contentType === 'pdf') {
        displayType = 'pdfUrl';
      } else if (this.isWebViewableImage(this.contentType)) {
        displayType = 'image';
      } else {
        displayType = 'unknown';
      }
    } else {
      displayType = 'unknown';
    }
    this.defaultDisplayType = displayType;
    this.displayType$.next(displayType);
    this.displayType = displayType;
    return displayType;
  }

  private isWebViewableImage(contentType: string): boolean {
    return (
      contentType === 'png' ||
      contentType === 'gif' ||
      contentType === 'jpg' ||
      contentType === 'jpeg' ||
      contentType === 'bmp'
    );
  }

  public displayFilePreview(file: File) {
    console.log('Reading data from local file');
    const mimeType = file.type;
    let reader = this.reader;
    if (reader) {
      reader.abort();
    } else {
      this.reader = new FileReader();
      reader = this.reader;
    }

    if (mimeType === 'application/pdf') {
      reader.onload = this._whenPreviewFileLoaded.bind(this);
      reader.readAsArrayBuffer(file); // ng2-pdf-preview does not accept DataUrl
    } else if (mimeType === 'text/plain') {
      reader.onload = this._whenTextFileLoaded.bind(this);
      reader.readAsText(file);
    } else {
      reader.onload = this._whenPreviewFileLoaded.bind(this);
      reader.readAsDataURL(file);
    }
  }

  public getFile(): File {
    return this.file;
  }

  public setUrl(url: string) {
    this.url = url;
    this.loaded$.next(true);
  }

  private _whenPreviewFileLoaded(e) {
    const reader = e.target;
    const data = reader.result;
    let url;
    if (data instanceof ArrayBuffer) {
      url = '';
      this.pdfDataSource = { data: data };
    } else {
      this.pdfDataSource = null;
      url = data;
    }
    this.determineUrlType(url);
    this.setUrl(url);
  }

  private _whenTextFileLoaded(e) {
    const reader = e.target;
    this.text = reader.result;
    const url = 'data:text/plain';
    this.determineUrlType(url);
    this.setUrl(url);
  }

  public determineUrlType(url: string): void {
    // const url = this.url.toString();
    let displayType = 'blank';
    if (!isNullOrUndefined(this.pdfDataSource)) {
      displayType = 'pdfData';
    } else if (url.startsWith('http')) {
      displayType = this.defaultDisplayType;
    } else if (url.startsWith('data:image')) {
      displayType = 'image';
    } else if (url.startsWith('data:application/pdf')) {
      displayType = 'pdf';
    } else if (url.startsWith('data:text/plain')) {
      displayType = 'text';
    } else if (url.startsWith('data:')) {
      displayType = 'unknown-dataURI';
    } else {
      displayType = 'unknown';
    }
    this.displayType$.next(displayType);
    this.displayType = displayType;
  }
}
