import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../model/config';
import { PageConfig } from '../../model/page-config';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-generic-page',
  templateUrl: './generic-page.component.html',
  styleUrls: ['./generic-page.component.css']
})
export class GenericPageComponent implements OnInit {

  config: Config;
  pageConfig: PageConfig;
  page: string;

  constructor(private route: ActivatedRoute, private titleService: Title) {
  }

  ngOnInit() {
    this.route.paramMap
      .subscribe(
        params => {
          this.page = params.get('page');
          this.route.data
            .subscribe((data: { config: Config }) => {
                this.config = data.config;
                this.pageConfig = data.config.pages[this.page.toLowerCase()];
                console.log(JSON.stringify(this.config));
                this.titleService.setTitle(this.pageConfig.pageName);
              }
            );
        }
      );


  }

}
