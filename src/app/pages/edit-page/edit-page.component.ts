import { Component, OnInit, Output } from '@angular/core';
import { EditPageConfig } from '../../model/edit-page-config';
import { ActivatedRoute } from '@angular/router';

import { ContentService } from '../../services/content.service';
import { ContentResult } from '../../model/content-result';
import { Config } from '../../model/config/config';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit {
  config: Config;
  pageConfig: EditPageConfig;
  page: string;
  id: string;
  @Output() contentItem: ContentResult;

  constructor(private route: ActivatedRoute, private contentService: ContentService) {}

  ngOnInit() {
    console.log('init edit page component');
    this.route.paramMap.subscribe(params => {
      this.page = params.get('page');
      this.id = params.get('id');
      this.route.data.subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()].editPageConfig;
        //  this.titleService.setTitle(this.pageConfig.pageName); // TODO: Should I use this?
        this.contentService.read(this.id).subscribe(res => (this.contentItem = res));
      });
    });
  }
}
