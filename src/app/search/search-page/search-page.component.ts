import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Config } from '../../core/shared/model/config';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Title } from '@angular/platform-browser';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchService } from '../shared/search.service';
import { Subject, Subscription } from 'rxjs';
import { DataService } from '../../shared/providers/data.service';
import { Sort } from '../shared/model/sort';
import * as _ from 'lodash';

import { StudentSearchAutocomplete } from '../shared/search-autocomplete/student-search-autocomplete';
import { StudentService } from '../../shared/providers/student.service';
import { SearchAutocomplete } from '../shared/search-autocomplete/search-autocomplete';
import { NotificationService } from '../../shared/providers/notification.service';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { PersonSearchAutocomplete } from '../shared/search-autocomplete/person-search-autocomplete';
import { PersonService } from '../../shared/providers/person.service';

const LEFT_PANEL_VISIBLE_STATE_KEY = 'isLeftPanelVisible';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private componentDestroyed = new Subject();
  private searchSubscription: Subscription;
  searchDebounceTime = 400;
  config: Config;
  pageConfig: SearchPageConfig;
  page: string;

  searchModel$ = new Subject<SearchModel>();
  searchResults$ = new Subject<SearchResults>();
  searchAutocomplete: SearchAutocomplete;

  initialSearchModel: SearchModel;
  isLeftPanelVisible = true;
  isToggleLeftPanelButtonVisible = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private searchService: SearchService,
    private dataService: DataService,
    private personService: PersonService,
    private router: Router,
    private studentService: StudentService,
    private notificationService: NotificationService,
    private liveAnnouncer: LiveAnnouncer
  ) {
    console.log('init generic page component');
    if (this.activatedRoute.snapshot.queryParams != null) {
      const initialSearch = this.activatedRoute.snapshot.queryParams.s;
      if (initialSearch != null) {
        console.log('found initial search : ' + initialSearch);
        this.initialSearchModel = SearchModel.fromJson(initialSearch);
      }
    }

    if (this.initialSearchModel == null) {
      this.initialSearchModel = new SearchModel();
    }
  }

  ngAfterViewInit(): void {
    const cachedSearch = this.dataService.get('currentSearch');
    if (cachedSearch) {
      // TODO what is this ?
      console.log('got cached search : ' + JSON.stringify(cachedSearch));
      this.searchModel$.next(Object.assign(new SearchModel(), cachedSearch));
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(takeUntil(this.componentDestroyed)).subscribe(params => {
      this.page = params.get('page');
      this.activatedRoute.data.pipe(takeUntil(this.componentDestroyed)).subscribe((data: { config: Config }) => {
        const pageConfigChanged = !!this.pageConfig;

        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()];

        this.initializeToggleLeftPanelButton(this.pageConfig);

        if (
          isNullOrUndefined(this.pageConfig.defaultSort) ||
          isNullOrUndefined(this.pageConfig.defaultSort.term) ||
          isNullOrUndefined(this.pageConfig.defaultSort.order)
        ) {
          this.pageConfig.defaultSort = new Sort('id', 'desc');
        }
        this.titleService.setTitle(this.pageConfig.pageName);
        if (this.pageConfig.autocompleteConfig) {
          switch (this.pageConfig.autocompleteConfig.type) {
            case 'studentAutocomplete':
              this.searchAutocomplete = new StudentSearchAutocomplete(
                this.studentService,
                this.pageConfig.autocompleteConfig.filterKey,
                this.pageConfig.autocompleteConfig.filterLabel
              );
              break;
            case 'personAutocomplete':
              this.searchAutocomplete = new PersonSearchAutocomplete(
                this.personService,
                this.pageConfig.autocompleteConfig.filterKey,
                this.pageConfig.autocompleteConfig.filterLabel
              );
              break;
            default:
              throw new Error('No autocompleter for ' + this.pageConfig.autocompleteConfig.type);
          }
        }

        this.addSearchSubscription();

        if (pageConfigChanged) {
          // If the page config changed after the page loaded, submit an empty search model to the new subscription.
          this.searchModel$.next(new SearchModel());
        }
      });

      this.searchModel$.next(this.initialSearchModel);
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
        switchMap((searchModel: SearchModel) => {
          return this.searchService.search(searchModel, this.pageConfig);
        })
      )
      .subscribe(
        (searchResults: SearchResults) => {
          /* we are not sending the search results observable
          directly to the underlying components
          as doing so makes all the components subscribe
          to the search service and execute multiple searches
          */
          this.searchResults$.next(searchResults);
        },
        err => {
          this.notificationService.error('error while executing search', err);
          // The subscription will close when there is an error, so we need to attach a new one.
          this.addSearchSubscription();
        }
      );
  }

  navigateToDisplaySearchPage() {
    console.log('go to display page');
    const queryParams: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    // queryParams['s'] = JSON.stringify(this.searchModel$.value);
    queryParams['s'] = JSON.stringify(this.searchModel$);

    this.router.navigate(['display-search'], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  onSearch(searchModel: SearchModel) {
    console.log('search in generic page component');
    this.searchModel$.next(Object.assign(new SearchModel(), searchModel));
  }

  toggleLeftPanel(): void {
    this.isLeftPanelVisible = !this.isLeftPanelVisible;

    this.dataService.set(LEFT_PANEL_VISIBLE_STATE_KEY, this.isLeftPanelVisible);

    const announcerMessage = this.isLeftPanelVisible ? 'Filter panel shown.' : 'Filter panel hidden.';
    this.liveAnnouncer.announce(announcerMessage, 'polite');
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  navigateToCreate() {
    this.router.navigate([this.config.tenant + '/create']);
  }

  private initializeToggleLeftPanelButton(pageConfig: SearchPageConfig): void {
    const facetsConfig =
      pageConfig && pageConfig.facetsConfig && pageConfig.facetsConfig.active && pageConfig.facetsConfig.facets;
    this.isToggleLeftPanelButtonVisible = facetsConfig && !_.isEmpty(facetsConfig);

    if (this.isToggleLeftPanelButtonVisible) {
      const leftPanelVisibleInitState = this.dataService.get(LEFT_PANEL_VISIBLE_STATE_KEY);
      this.isLeftPanelVisible = leftPanelVisibleInitState !== null ? leftPanelVisibleInitState : true;
    } else {
      this.isLeftPanelVisible = false;
    }
  }
}
