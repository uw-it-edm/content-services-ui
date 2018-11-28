import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Config } from '../../core/shared/model/config';
import { Title } from '@angular/platform-browser';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchService } from '../shared/search.service';
import { Subject } from 'rxjs/Subject';
import { DataService } from '../../shared/providers/data.service';
import { Sort } from '../shared/model/sort';
import { NotificationService } from '../../shared/providers/notification.service';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { BehaviorSubject } from 'rxjs';
import { ContentService } from '../../content/shared/content.service';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';

@Component({
  selector: 'app-display-search-page',
  templateUrl: './display-search-page.component.html',
  styleUrls: ['./display-search-page.component.css']
})
export class DisplaySearchPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private componentDestroyed = new Subject();
  config: Config;
  pageConfig: SearchPageConfig;
  page: string;

  searchModel$: BehaviorSubject<SearchModel>;
  searchResults: SearchResults;

  initialSearchModel: SearchModel;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private searchService: SearchService,
    private contentService: ContentService,
    private dataService: DataService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.searchModel$ = new BehaviorSubject<SearchModel>(new SearchModel());

    console.log('init Displays search page component');
    if (this.route.snapshot.queryParams != null) {
      const initialSearch = this.route.snapshot.queryParams.s;
      if (initialSearch != null) {
        console.log('found initial search : ' + initialSearch);
        this.initialSearchModel = SearchModel.fromJson(initialSearch);
      }
    }

    if (this.initialSearchModel == null) {
      // TODO what to do ?
      this.router.navigate([this.config.tenant]);
    }
  }

  ngAfterViewInit(): void {
    const cachedSearch = this.dataService.get('currentSearch');
    if (cachedSearch) {
      console.log('got cached search : ' + JSON.stringify(cachedSearch));
      this.searchModel$.next(Object.assign(new SearchModel(), cachedSearch));
    }
  }

  ngOnInit() {
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

        this.searchService.search(this.searchModel$, this.pageConfig).subscribe(
          (searchResults: SearchResults) => {
            /* we are not sending the search results observable
               directly to the underlying components
               as doing so makes all the components subscribe
               to the search service and execute multiple searches
               */
            this.searchResults = searchResults;
          },
          err => {
            this.notificationService.error('error while executing search', err);
          }
        );
      });

      this.searchModel$.next(this.initialSearchModel);
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
