import { Component, Input, OnInit } from '@angular/core';
import { ContentItem } from '../../model/content-item';
import { EditPageConfig } from '../../model/config/edit-page-config';

@Component({
  selector: 'app-content-metadata',
  templateUrl: './content-metadata.component.html',
  styleUrls: ['./content-metadata.component.css']
})
export class ContentMetadataComponent implements OnInit {
  @Input() pageConfig: EditPageConfig;
  @Input() contentItem: ContentItem;

  constructor() {}

  ngOnInit() {}
}
