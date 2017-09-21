import { Component, OnDestroy, OnInit } from '@angular/core';
import { EditPageConfig } from '../../core/shared/model/edit-page-config';
import { ActivatedRoute } from '@angular/router';

import { ContentService } from '../shared/content.service';
import { Config } from '../../core/shared/model/config';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { ContentItem } from '../shared/model/content-item';
import { PdfPreviewConfig } from '../shared/model/pdf-preview-config';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit, OnDestroy {
  config: Config;
  pageConfig: EditPageConfig;
  page: string;
  id: string;

  contentItem: ContentItem;
  contentItemUrl: string;
  displayType: string;
  pdfPreviewConfig: PdfPreviewConfig;
  imagePreviewUrl: string;

  private componentDestroyed = new Subject();

  constructor(private route: ActivatedRoute, private titleService: Title, private contentService: ContentService) {}

  /////////

  file: File; // TODO: should i use this?
  // TODO: confirm that we're looking at the local file
  fileChange(event) {
    const fileList: FileList = event.target.files;
    this.clearPreview();

    if (fileList.length > 0) {
      this.handleInputChange(event);
    }
  }

  // TODO: can this stuff be abstracted out?
  // TODO: what if not pdf?
  handleInputChange(e) {
    this.file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    const reader = new FileReader();

    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(this.file);
  }

  _handleReaderLoaded(e) {
    const reader = e.target;

    const fileType = this.determineFileType();
    if (fileType === 'pdf') {
      this.pdfPreviewConfig.source = reader.result;
      this.pdfPreviewConfig.isLoaded = true;
    } else if (fileType === 'image') {
      this.imagePreviewUrl = reader.result;
    }
    this.updateDisplayType();
  }

  private clearPreview() {
    this.imagePreviewUrl = undefined;
    this.pdfPreviewConfig.isLoaded = false;
    this.updateDisplayType();
  }

  // TODO: detect filetype (if pdf, or image , or text or? )
  // TODO: try using https://github.com/sindresorhus/image-type
  private determineFileType(): string {
    let fileType;
    if (this.file) {
      if (this.file.type === 'application/pdf') {
        fileType = 'pdf';
      } else if (this.file.type.match('image*')) {
        // TODO: Hack: this is not really valid we want to Detect the file type of a Buffer/Uint8Array
        fileType = 'image';
      } else {
        fileType = 'unknown';
      }
    }
    return fileType;
  }

  private updateDisplayType() {
    const fileType = this.determineFileType(); // TODO: i don't like calling this so much
    if (this.pdfPreviewConfig.isLoaded) {
      this.displayType = 'pdfPreview';
    } else if (this.imagePreviewUrl) {
      this.displayType = 'image';
    } else if (fileType === 'unknown') {
      this.displayType = 'unknown';
    } else {
      this.displayType = 'content-item';
    }
  }

  ///
  ngOnInit() {
    console.log('init edit page component');
    this.pdfPreviewConfig = new PdfPreviewConfig();
    this.route.paramMap.takeUntil(this.componentDestroyed).subscribe(params => {
      this.page = params.get('page');
      this.id = params.get('id');

      this.route.data.subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()].editPageConfig;
        this.titleService.setTitle(this.pageConfig.pageName);

        this.contentService
          .read(this.id)
          .takeUntil(this.componentDestroyed)
          .subscribe(
            contentItem => (this.contentItem = contentItem),
            err => console.error('There was an error reading the content-item:', err) // TODO: Handle error
          );
        this.contentItemUrl = this.contentService.getFileUrl(this.id, true);
      });
    });
    this.updateDisplayType();
  }

  onSave(savedItem: ContentItem) {
    this.contentService
      .update(savedItem)
      .takeUntil(this.componentDestroyed)
      .subscribe(updatedContentItem => (this.contentItem = updatedContentItem));
  }

  ngOnDestroy(): void {
    // prevent memory leak when component destroyed
    console.log('unsubscribe edit page');
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
