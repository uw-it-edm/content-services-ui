import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ContentResult } from '../../model/content-result';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit {
  private baseUrl = 'http://localhost:11000/content/v3/file/'; // TODO: should come from environments file
  private urlParameters = '?rendition=Web&forcePDF=true&x-uw-act-as=agagne'; // TODO should be dynamic? do i need the act as?

  url: SafeUrl;

  @Input() item: ContentResult;

  constructor(private sanitizer: DomSanitizer) {
    // TODO: read more about DomSantitizer
  }

  ngOnInit() {
    // '282639'; // TODO: example id
    const workingUrl = this.baseUrl + this.item.id + this.urlParameters;
    // TODO: how to handle if item.id is not there or invalid? or not pdf viewable?
    console.log('Working url: ', workingUrl);
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(workingUrl);
  }
}
