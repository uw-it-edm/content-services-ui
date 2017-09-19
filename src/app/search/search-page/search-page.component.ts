import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Config } from '../../core/shared/model/config';
import { PageConfig } from '../../core/shared/model/page-config';
import { Title } from '@angular/platform-browser';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchService } from '../shared/search.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {
  config: Config;
  pageConfig: PageConfig;
  page: string;

  searchModel$ = new Subject<SearchModel>();
  searchResults: SearchResults;

  constructor(private route: ActivatedRoute, private titleService: Title, private searchService: SearchService) {}

  ngOnInit() {
    console.log('init generic page component');
    this.searchResults = new SearchResults();

    this.route.paramMap.subscribe(params => {
      this.page = params.get('page');
      this.route.data.subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()];
        this.titleService.setTitle(this.pageConfig.pageName);

        this.searchService.search(this.searchModel$, this.pageConfig).subscribe(searchResult => {
          this.searchResults = searchResult;
        });
      });

      this.searchModel$.next(new SearchModel());
      this.searchResults = new SearchResults();
    });
  }

  onSearch(searchModel: SearchModel) {
    console.log('search in generic page component');
    this.searchModel$.next(Object.assign(new SearchModel(), searchModel));
  }
}
