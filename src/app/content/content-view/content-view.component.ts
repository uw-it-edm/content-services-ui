import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ContentService } from '../shared/content.service';

import { ProgressService } from '../../shared/providers/progress.service';
import { ContentObject } from '../shared/model/content-object';
import { ContentToolbarComponent } from '../content-toolbar/content-toolbar.component';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css'],
})
export class ContentViewComponent implements OnInit, OnChanges, OnDestroy {
  private componentDestroyed = new Subject();

  @Input()
  contentObject: ContentObject;
  @Input()
  allowPageByPageMode = false;
  @Input()
  allowFullHeightDisplay = false;
  @Input()
  showPdfInIframe = false;
  @Input()
  allowFullScreen = true;

  autoResize = false;
  fitToPage = true;
  fullScreen = false;
  originalSize = false;
  pageCount = 1;
  pageNumber = 1;
  renderText = true;
  showAll = true;
  stickToPage = false;
  zoom = 1.0;
  zoomFactor = 'automatic-zoom';
  downloadUrl: string;

  constructor(
    private contentService: ContentService,
    public progressService: ProgressService,
    private sanitizer: DomSanitizer
  ) {}

  @ViewChild(ContentToolbarComponent)
  contentToolbarComponent;
  @ViewChild(PdfViewerComponent)
  pdfViewer: PdfViewerComponent;

  ngOnInit() {
    console.log('init content view component for ' + this.contentObject);
    this.pageCount = 1;
    this.pageNumber = 1;
    if (this.contentObject) {
      this.onContentObjectChanged(this.contentObject);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pageCount = 1;
    this.pageNumber = 1;

    if (changes.contentObject && changes.contentObject.currentValue) {
      this.onContentObjectChanged(changes.contentObject.currentValue);
      this.onZoomFactorChanged(this.zoomFactor);
    }
  }

  public reset() {}

  onContentObjectChanged(contentObject: ContentObject) {
    this.pageCount = 1;
    if (contentObject) {
      const mode = contentObject.contentType === 'pdf' ? 'determinate' : 'indeterminate';
      const displayType = contentObject.displayType;
      console.log('Display type: ' + displayType);
      if (displayType === 'pdf' || displayType.startsWith('image/')) {
        this.progressService.start(mode, 'primary', contentObject.contentLength);
      }
    } else {
      this.progressService.end();
    }
    this.updateDownloadUrl();
  }

  onDisplayComplete(pdf: any) {
    console.log('display complete for ' + this.contentObject.itemId);
    this.updateDownloadUrl();
    this.progressService.end();
    this.pageCount = pdf.numPages;
  }

  private updateDownloadUrl(): void {
    if (this.contentObject && this.contentObject.itemId && this.contentObject.url !== '') {
      this.downloadUrl = this.buildUrl(this.contentObject.itemId, true, true, 'attachment');
    } else {
      this.downloadUrl = undefined;
    }
  }

  onDisplayError() {
    console.log('display error');
    this.progressService.end();
  }

  onDisplayProgress(progressData: any) {
    console.log('Progress for ' + this.contentObject.itemId + ' : ' + JSON.stringify(progressData));

    const loaded = progressData.loaded;
    this.progressService.progress(loaded);
  }

  onFullScreenChanged(fullScreen: boolean) {
    this.fullScreen = fullScreen;
  }

  onImageLoaded() {
    this.progressService.end();
  }

  onPageChanged(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  onZoomFactorChanged(zoomFactor: string) {
    console.log(zoomFactor);
    this.autoResize = false;
    this.fitToPage = false;
    this.originalSize = false;
    this.stickToPage = false;
    this.zoom = 1.0;
    this.zoomFactor = zoomFactor;
    if (zoomFactor === 'actual-size') {
      this.originalSize = true;
      this.fitToPage = true;
    } else if (zoomFactor === 'automatic-zoom') {
      this.autoResize = true;
    } else if (zoomFactor === 'page-width') {
      this.fitToPage = true;
    } else {
      this.originalSize = false;
      this.zoom = parseFloat(zoomFactor);
    }
  }

  getIframeUrlForPDF(url: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url + '#view=FitH');
  }

  buildUrl(id: string, isWebViewable = true, useOriginalFilename = true, disposition?: string) {
    return this.contentService.getFileUrl(id, isWebViewable, useOriginalFilename, disposition);
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  download(id: string) {
    window.open(this.buildUrl(id, false, true, 'attachment'), '_blank');
  }
}
