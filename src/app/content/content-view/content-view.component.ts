import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PdfPreviewConfig } from '../shared/model/pdf-preview-config';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit {
  url: SafeUrl;

  @Input() pdfPreviewConfig: PdfPreviewConfig;
  @Input() contentItemUrl: string;
  @Input() displayType: string;
  @Input() imagePreviewUrl: string;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    console.log('Working url: ', this.contentItemUrl);
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.contentItemUrl);
  }
}
