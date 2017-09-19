import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../model/config/config';
import { PageConfig } from '../../model/config/page-config';
import { Title } from '@angular/platform-browser';
import { SearchModel } from '../../model/search/search-model';
import { SearchResults } from '../../model/search-result';
import { SearchService } from '../../services/search.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-generic-page',
  templateUrl: './generic-page.component.html',
  styleUrls: ['./generic-page.component.css']
})
export class GenericPageComponent implements OnInit {
  config: Config;
  pageConfig: PageConfig;
  page: string;

  searchModel$ = new Subject<SearchModel>();
  searchResults$: Observable<SearchResults>;

  constructor(private route: ActivatedRoute, private titleService: Title, private searchService: SearchService) {}

  ngOnInit() {
    console.log('init generic page component');

    this.route.paramMap.subscribe(params => {
      this.page = params.get('page');
      this.route.data.subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()];
        this.titleService.setTitle(this.pageConfig.pageName);
        this.searchResults$ = this.searchService.search(this.searchModel$, this.pageConfig);
      });

      this.searchModel$.next(new SearchModel());
    });
  }

  onSearch(searchModel: SearchModel) {
    console.log('search in generic page component');
    this.searchModel$.next(Object.assign(new SearchModel(), searchModel));
  }
}
