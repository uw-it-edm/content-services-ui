import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';
import { ContentService } from '../shared/content.service';
import 'rxjs/add/operator/takeUntil';
import { ProgressService } from '../../shared/providers/progress.service';
import { ContentObject } from '../shared/model/content-object';
import { PdfViewerComponent } from 'ng2-pdf-viewer/dist/pdf-viewer.component';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit, OnChanges, OnDestroy {
  private componentDestroyed = new Subject();

  contentObject: ContentObject;

  autoResize = false;
  fitToPage = true;
  fullScreen = false;
  originalSize = false;
  pageCount: number;
  pageNumber: number;
  renderText = true;
  showAll = false;
  stickToPage = false;
  zoom = 1.0;

  constructor(private contentService: ContentService, public progressService: ProgressService) {}

  @ViewChild(PdfViewerComponent) pdfViewer: PdfViewerComponent;

  ngOnInit() {
    this.pageNumber = 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pageNumber = 1;
  }

  onContentObjectChanged(contentObject: ContentObject) {
    this.contentObject = contentObject;
    this.pageCount = undefined;
    const mode = this.contentObject.contentType === 'application/pdf' ? 'determinate' : 'indeterminate';
    const displayType = this.contentObject.displayType;
    if (displayType !== 'unknown') {
      this.progressService.start(mode, 'primary', contentObject.contentLength);
    }
  }

  onDisplayComplete(pdf: any) {
    this.progressService.end();
    this.pageCount = pdf.numPages;
    this.onZoomFactorChanged('automatic-zoom');
  }

  onDisplayError() {
    this.progressService.end();
  }

  onDisplayProgress(progressData: any) {
    console.log('Progress: ' + JSON.stringify(progressData));

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

  buildUrl(id: string, isWebViewable = true, disposition?: string) {
    return this.contentService.getFileUrl(id, isWebViewable, disposition);
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  download(id: string) {
    window.location.href = this.buildUrl(id, false, 'attachment');
  }
}
