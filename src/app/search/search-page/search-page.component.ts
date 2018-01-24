import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Config } from '../../core/shared/model/config';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Title } from '@angular/platform-browser';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchService } from '../shared/search.service';
import { Subject } from 'rxjs/Subject';
import { DataService } from '../../shared/providers/data.service';
import { Sort } from '../shared/model/sort';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private componentDestroyed = new Subject();
  config: Config;
  pageConfig: SearchPageConfig;
  page: string;

  searchModel$ = new Subject<SearchModel>();
  searchResults$ = new Subject<SearchResults>();

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private searchService: SearchService,
    private dataService: DataService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    const cachedSearch = this.dataService.get('currentSearch');
    if (cachedSearch) {
      this.searchModel$.next(Object.assign(new SearchModel(), cachedSearch));
    }
  }

  ngOnInit() {
    console.log('init generic page component');

    this.route.paramMap.takeUntil(this.componentDestroyed).subscribe(params => {
      this.page = params.get('page');
      this.route.data.takeUntil(this.componentDestroyed).subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()];
        if (
          isNullOrUndefined(this.pageConfig.defaultSort) ||
          isNullOrUndefined(this.pageConfig.defaultSort.term) ||
          isNullOrUndefined(this.pageConfig.defaultSort.order)
        ) {
          this.pageConfig.defaultSort = new Sort('id', 'desc');
        }
        this.titleService.setTitle(this.pageConfig.pageName);
        this.searchService.search(this.searchModel$, this.pageConfig).subscribe((searchResults: SearchResults) => {
          /* we are not sending the search results observable
             directly to the underlying components
             as doing so makes all the components subscribe
             to the search service and execute multiple searches
             */
          this.searchResults$.next(searchResults);
        });
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
    this.router.navigate([this.config.tenant + '/create']);
  }
}
