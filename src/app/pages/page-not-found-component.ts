import { Component, OnInit } from '@angular/core';
import { Config } from '../model/config/config';
import { ActivatedRoute } from '@angular/router';
import { PageConfig } from '../model/config/page-config';
import { isNullOrUndefined } from 'util';

@Component({
  moduleId: module.id,
  selector: 'app-404',
  template: `
    <article>
      <h1>Inconceivable!</h1>
      <div>I do not think this page is where you think it is.</div>
      <md-menu #pageMenu="mdMenu">
        <button md-menu-item
          *ngFor="let page of getPageList()"
                routerLink="/{{config.tenant}}/{{page}}"
                routerLinkActive="active">
          <span>{{page}}</span>
        </button>
      </md-menu>
      <button md-icon-button [mdMenuTriggerFor]="pageMenu">
        <md-icon>more_vert</md-icon>
      </button>
    </article>
  `
})
export class PageNotFoundComponent implements OnInit {
  config: Config;
  pageConfig: PageConfig;
  page: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    console.log('init generic page component');

    this.route.paramMap.subscribe(params => {
      this.page = params.get('page');
      this.route.data.subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()];
      });
    });
  }

  getPageList(): string[] {
    if (!isNullOrUndefined(this.config)) {
      return Object.keys(this.config.pages).sort();
    }
    return [];
  }
}
