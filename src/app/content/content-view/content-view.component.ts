import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';
import { ContentService } from '../shared/content.service';
import 'rxjs/add/operator/takeUntil';
import { ProgressService } from '../../shared/providers/progress.service';
import { ContentObject } from '../shared/model/content-object';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit, OnChanges, OnDestroy {
  private componentDestroyed = new Subject();

  contentObject: ContentObject;

  fitToPage = false;
  originalSize = true;
  pageCount: number;
  pageNumber: number;
  renderText = true;
  showAll = true;
  stickToPage = false;

  constructor(private contentService: ContentService, private progressService: ProgressService) {}

  ngOnInit() {
    this.pageNumber = 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pageNumber = 1;
  }

  onContentObjectChanged(contentObject: ContentObject) {
    this.contentObject = contentObject;
    this.progressService.start('determinate', 'primary', contentObject.contentLength);
  }

  onDisplayComplete(pdf: any) {
    this.progressService.end();
    this.pageCount = pdf.numPages;
  }

  onDisplayError() {
    this.progressService.end();
  }

  onDisplayProgress(progressData: any) {
    console.log('Progress: ' + JSON.stringify(progressData));

    const loaded = progressData.loaded;
    this.progressService.progress(loaded);
  }

  onPageChanged(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  private buildUrl(id: string, isWebViewable = true, disposition?: string) {
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
