import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Config } from '../../core/shared/model/config';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Title } from '@angular/platform-browser';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchService } from '../shared/search.service';
import { ResultRow } from '../shared/model/result-row';
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
import { AutoFocusNavigationState } from '../../shared/shared/auto-focus-navigation-state';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { UserService } from '../../user/shared/user.service';

const LEFT_PANEL_VISIBLE_STATE_KEY = 'isLeftPanelVisible';
const DEFAULT_BULK_EDIT_MAX_COUNT = 50;

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css'],
})
export class SearchPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private componentDestroyed = new Subject();
  private searchSubscription: Subscription;
  private _isLeftPanelVisible = true;
  private _isToggleLeftPanelButtonVisible = false;
  private _selectedRows: ResultRow[] = [];

  searchDebounceTime = 400;
  config: Config;
  pageConfig: SearchPageConfig;
  page: string;

  searchModel$ = new Subject<SearchModel>();
  searchResults$ = new Subject<SearchResults>();
  searchAutocomplete: SearchAutocomplete;

  initialSearchModel: SearchModel;
  isBulkEditMode = false;
  bulkEditMaxCount = DEFAULT_BULK_EDIT_MAX_COUNT;
  hasWritePermission = false;

  @ViewChild(SearchBoxComponent) searchBoxComponent: SearchBoxComponent;

  get isLeftPanelVisible(): boolean {
    return this._isLeftPanelVisible && !this.isBulkEditMode;
  }

  get isToggleLeftPanelButtonVisible(): boolean {
    return this._isToggleLeftPanelButtonVisible && !this.isBulkEditMode;
  }

  get isSearchBoxVisible(): boolean {
    return !this.isBulkEditMode;
  }

  get selectedRows(): ResultRow[] {
    return this._selectedRows;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private searchService: SearchService,
    private dataService: DataService,
    private personService: PersonService,
    private router: Router,
    private studentService: StudentService,
    private notificationService: NotificationService,
    private liveAnnouncer: LiveAnnouncer,
    private changeDetectorRef: ChangeDetectorRef,
    private userService: UserService
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
    } else {
      // initialSearchModel should set after all components load, so that they will be subscribed to the searchModel$
      this.searchModel$.next(this.initialSearchModel);
    }

    const navigationState: AutoFocusNavigationState = history.state;
    if (navigationState && navigationState.autoFocusOnNavigate) {
      this.searchBoxComponent.focusSearchBox();
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnInit() {
    this.hasWritePermission = this.doesUserHasWritePermission();
    this.activatedRoute.paramMap.pipe(takeUntil(this.componentDestroyed)).subscribe((params) => {
      this.page = params.get('page');
      this.activatedRoute.data.pipe(takeUntil(this.componentDestroyed)).subscribe((data: { config: Config }) => {
        const pageConfigChanged = !!this.pageConfig;

        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()];
        this.isBulkEditMode = false;
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
        (err) => {
          this.notificationService.error('error while executing search', err);
          // The subscription will close when there is an error, so we need to attach a new one.
          this.addSearchSubscription();
        }
      );
  }

  navigateToDisplaySearchPage() {
    console.log('go to display page');
    const queryParams: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);

    this.router.navigate(['display-search'], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  toggleBulkEditMode(): void {
    this.isBulkEditMode = !this.isBulkEditMode;

    // Need to call detectChanges so that UI is updated with the latest state. After the UI is
    //  updated, if the search box is visible, set the focus on it.
    this.changeDetectorRef.detectChanges();

    if (!this.isBulkEditMode) {
      this.searchBoxComponent.focusSearchBox();
    }
  }

  navigateToBulkEdit(): void {
    if (this._selectedRows.length > 0) {
      this.router.navigate([this.config.tenant + '/bulk-edit'], { state: { selectedRows: this._selectedRows } });
    }
  }

  onSelectRows(rows: ResultRow[]): void {
    this._selectedRows = rows;
  }

  onSearch(searchModel: SearchModel) {
    console.log('search in generic page component');
    this.searchModel$.next(Object.assign(new SearchModel(), searchModel));
  }

  toggleLeftPanel(): void {
    this._isLeftPanelVisible = !this._isLeftPanelVisible;

    this.dataService.set(LEFT_PANEL_VISIBLE_STATE_KEY, this._isLeftPanelVisible);

    const announcerMessage = this._isLeftPanelVisible ? 'Filter panel shown.' : 'Filter panel hidden.';
    this.liveAnnouncer.announce(announcerMessage, 'polite');
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  navigateToCreate() {
    this.router.navigate([this.config.tenant + '/create']);
  }

  /**
   * Returns true if user has at least one account with write permission.
   * Note: possible permissions are "r", "rw", "rwd", and "admin".
   */
  private doesUserHasWritePermission() {
    const user = this.userService.getUser();

    // The type of accounts is Map<string,string> but at runtime it may be Object.
    const accounts = user && user.accounts && this.convertObjectToMap(user.accounts);

    if (accounts) {
      // Only consider WCC accounts for CON, PUB and RES to discover permissions.
      return Array.from(accounts.keys())
        .filter((key) => key.startsWith('CON-') || key.startsWith('RES-') || key.startsWith('PUB-'))
        .map((key) => accounts.get(key))
        .some((permission) => permission.indexOf('w') >= 0 || permission.indexOf('admin') >= 0);
    }

    return false;
  }

  private convertObjectToMap(obj: any): Map<string, string> {
    if (!(obj instanceof Map)) {
      return new Map<string, string>(Object.keys(obj).map((k) => [k, obj[k]]));
    }

    return obj;
  }

  private initializeToggleLeftPanelButton(pageConfig: SearchPageConfig): void {
    const facetsConfig = pageConfig && pageConfig.facetsConfig && pageConfig.facetsConfig.active && pageConfig.facetsConfig.facets;
    this._isToggleLeftPanelButtonVisible = facetsConfig && !_.isEmpty(facetsConfig);

    if (this._isToggleLeftPanelButtonVisible) {
      const leftPanelVisibleInitState = this.dataService.get(LEFT_PANEL_VISIBLE_STATE_KEY);
      this._isLeftPanelVisible = leftPanelVisibleInitState !== null ? leftPanelVisibleInitState : true;
    } else {
      this._isLeftPanelVisible = false;
    }
  }
}
