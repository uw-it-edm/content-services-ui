import { Component, Input, OnInit } from '@angular/core';
import { ContentResult } from '../../model/content-result';
import { Observable } from 'rxjs/Observable';
import { EditPageConfig } from '../../model/edit-page-config';
@Component({
  selector: 'app-content-metadata',
  templateUrl: './content-metadata.component.html',
  styleUrls: ['./content-metadata.component.css']
})
export class ContentMetadataComponent implements OnInit {
  @Input() contentItem: Observable<ContentResult>;
  @Input() pageConfig: EditPageConfig;

  constructor() {}

  ngOnInit() {}
}
