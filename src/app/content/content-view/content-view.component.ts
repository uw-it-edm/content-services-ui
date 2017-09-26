import { Component, Input, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { ContentItem } from '../shared/model/content-item';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit {
  url: SafeUrl;
  item: ContentItem;
  @Input() item$: Observable<ContentItem>;
  @Input() url$: Observable<string>;

  pageNumber: number;

  constructor() {}

  ngOnInit() {
    this.pageNumber = 1;
    this.url$.subscribe(inputUrl => {
      this.url = inputUrl;
    });
    this.item$.subscribe(inputItem => {
      this.item = inputItem;
    });
  }
}
