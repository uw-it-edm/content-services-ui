import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Config } from '../../core/shared/model/config';
import { PageConfig } from '../../core/shared/model/page-config';
import { Title } from '@angular/platform-browser';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchService } from '../shared/search.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  config: Config;
  pageConfig: PageConfig;
  page: string;

  searchModel$ = new Subject<SearchModel>();
  searchResults$: Observable<SearchResults>;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('init generic page component');

    this.route.paramMap.takeUntil(this.componentDestroyed).subscribe(params => {
      this.page = params.get('page');
      this.route.data.takeUntil(this.componentDestroyed).subscribe((data: { config: Config }) => {
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

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  navigateToCreate() {
    this.router.navigate([this.config.tenant + '/' + this.page + '/create']);
  }
}
