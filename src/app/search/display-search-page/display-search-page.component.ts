import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Config } from '../../core/shared/model/config';
import { Title } from '@angular/platform-browser';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchService } from '../shared/search.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { DataService } from '../../shared/providers/data.service';
import { Sort } from '../shared/model/sort';
import { NotificationService } from '../../shared/providers/notification.service';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { ContentService } from '../../content/shared/content.service';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-display-search-page',
  templateUrl: './display-search-page.component.html',
  styleUrls: ['./display-search-page.component.css']
})
export class DisplaySearchPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private searchSubscription: Subscription;
  private componentDestroyed = new Subject();
  searchDebounceTime = 400;
  config: Config;
  pageConfig: SearchPageConfig;
  page: string;

  searchModel$: Subject<SearchModel>;
  searchResults: SearchResults;

  initialSearchModel: SearchModel;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private searchService: SearchService,
    private contentService: ContentService,
    private dataService: DataService,
    private router: Router,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.searchModel$ = new Subject<SearchModel>();

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
      this.changeDetectorRef.detectChanges();
    } else {
      // initialSearchModel should set after all components load, so that they will be subscribed to the searchModel$
      this.searchModel$.next(this.initialSearchModel);
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.componentDestroyed)).subscribe(params => {
      this.page = params.get('page');
      this.route.data.pipe(takeUntil(this.componentDestroyed)).subscribe((data: { config: Config }) => {
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

        this.addSearchSubscription();
      });
    });
  }

  private addSearchSubscription() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.searchSubscription = this.searchModel$
      .pipe(
        debounceTime(this.searchDebounceTime),
        distinctUntilChanged(),
        switchMap(searchModel => this.searchService.search(searchModel, this.pageConfig))
      )
      .subscribe(
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
          // The subscription will close when there is an error, so we need to attach a new one.
          this.addSearchSubscription();
        }
      );
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
