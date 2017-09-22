import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit {
  url: SafeUrl;

  @Input() inputUrl: Observable<string>;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    console.log('Working url: ', this.inputUrl);
    this.inputUrl.subscribe(inputUrl => {
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(inputUrl);
    });
  }
}
