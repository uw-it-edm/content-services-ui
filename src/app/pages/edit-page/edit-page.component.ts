import { Component, OnDestroy, OnInit } from '@angular/core';
import { EditPageConfig } from '../../model/config/edit-page-config';
import { ActivatedRoute } from '@angular/router';

import { ContentService } from '../../services/content.service';
import { ContentItem } from '../../model/content-item';
import { Config } from '../../model/config/config';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

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
  viewFileUrl: string;

  private componentDestroyed = new Subject();

  constructor(private route: ActivatedRoute, private titleService: Title, private contentService: ContentService) {}

  ngOnInit() {
    console.log('init edit page component');

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
          .subscribe(contentItem => (this.contentItem = contentItem));
        this.viewFileUrl = this.contentService.getFileUrl(this.id, true);
      });
    });
  }

  onSave(savedItem: ContentItem) {
    this.contentService
      .update(savedItem)
      .takeUntil(this.componentDestroyed)
      .subscribe(); // TODO: handle response
  }

  ngOnDestroy(): void {
    // prevent memory leak when component destroyed
    console.log('unsubscribe edit page');
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
