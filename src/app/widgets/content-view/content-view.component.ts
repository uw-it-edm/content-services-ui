import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit {
  url: SafeUrl;

  @Input() inputUrl: string;

  constructor(private sanitizer: DomSanitizer) {
    // TODO: read more about DomSantitizer
  }

  ngOnInit() {
    // '282639'; // TODO: example id
    console.log('Working url: ', this.inputUrl);
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.inputUrl);
  }
}
