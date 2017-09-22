import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit {
  url: SafeUrl;

  @Input() item: any;
  @Input() inputUrl: string;

  pageNumber: number;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    console.log('Working url: ', this.inputUrl);
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.inputUrl);
    this.pageNumber = 1;
  }
}
