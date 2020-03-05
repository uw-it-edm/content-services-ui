import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Observable, Subject } from 'rxjs';
import { SearchDataSource } from '../shared/model/search-datasource.model';
import { MatPaginator, MatSort, PageEvent, Sort, SortDirection, MatSortHeaderIntl } from '@angular/material';
import { PaginatorConfig } from '../shared/model/paginator-config';
import { DataService } from '../../shared/providers/data.service';
import { SearchUtility } from '../shared/search-utility';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { SearchPagination } from '../shared/model/search-pagination';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ObjectUtilities } from '../../core/util/object-utilities';
import { Field, isFieldRightAligned } from '../../core/shared/model/field';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  private _pageConfig: SearchPageConfig;
  private fieldToLabelMap: { [id: string]: string } = {};
  searchModel: SearchModel = new SearchModel();
  paginatorConfig: PaginatorConfig = new PaginatorConfig();

  dataSource: SearchDataSource;
  displayedColumns = [];
  hasResults = false;

  // It seems to be necessary to data-bind these to the mat-table instead of just manipulating
  // the existing MatSort ViewChild because of how Angular times the rendering of the sort arrows
  // and orders its digestion of events
  sortTerm: string;
  sortDirection: SortDirection;

  @Input()
  searchModel$: Observable<SearchModel>;
  @Input()
  searchResults$: Subject<SearchResults>;
  @Output()
  search = new EventEmitter<SearchModel>();

  @Input()
  set pageConfig(config: SearchPageConfig) {
    this._pageConfig = config;
    this.fieldToLabelMap = this.configureTableColumns(config);
  }

  get pageConfig(): SearchPageConfig {
    return this._pageConfig;
  }

  @ViewChild(MatPaginator)
  topPaginator: MatPaginator;
  @ViewChild(MatPaginator)
  bottomPaginator: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort = new MatSort();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data: DataService,
    private liveAnnouncer: LiveAnnouncer,
    private matSortService: MatSortHeaderIntl
  ) {}

  ngOnInit(): void {
    this.dataSource = new SearchDataSource(this.searchModel$, this.searchResults$, this.sort, [
      this.topPaginator,
      this.bottomPaginator
    ]);

    this.searchModel$.pipe(takeUntil(this.componentDestroyed)).subscribe(searchModel => {
      this.onSearchModelChanged(searchModel);
    });

    this.searchResults$.pipe(takeUntil(this.componentDestroyed)).subscribe(results => {
      this.onSearchResultsChanged(results);
    });

    this.sort.sortChange.subscribe((sort: Sort) => {
      this.searchModel.order.order = sort.direction;
      this.searchModel.order.term = sort.active;
      this.search.next(this.searchModel);
    });
  }

  private onSearchResultsChanged(results: SearchResults): void {
    this.hasResults = !isNullOrUndefined(results) && results.total > 0;
    if (this.hasResults) {
      this.paginatorConfig.numberOfResults = results.total;
    } else {
      this.paginatorConfig.numberOfResults = 0;
    }

    this.initializeSort(results.sort);

    const searchResultsUpdatedMessage = this.getSearchResultsUpdatedMessage(
      this.paginatorConfig.numberOfResults,
      this.paginatorConfig.pageSize,
      this.paginatorConfig.pageIndex,
      this.sortTerm,
      this.sortDirection,
      this.fieldToLabelMap
    );

    console.log(searchResultsUpdatedMessage);
    this.liveAnnouncer.announce(searchResultsUpdatedMessage, 'assertive');

    const adjacentIds = results.results.map(result => result['id']); // store a list of result ids to be passed to edit page
    this.data.set('adjacentIds', adjacentIds);
  }

  private onSearchModelChanged(searchModel: SearchModel): void {
    this.searchModel = searchModel;
    if (this.searchModel.pagination != null) {
      if (this.searchModel.pagination.pageIndex != null) {
        this.paginatorConfig.pageIndex = this.searchModel.pagination.pageIndex;
      }
      if (this.searchModel.pagination.pageSize != null) {
        this.paginatorConfig.pageSize = this.searchModel.pagination.pageSize;
      }
    }
    if (this.searchModel.order != null) {
      this.initializeSort(searchModel.order);
    }
  }

  private getSearchResultsUpdatedMessage(
    length: number,
    pageSize: number,
    page: number,
    sortTerm: string,
    sortDirection: SortDirection,
    fieldToLabelMap: { [id: string]: string }
  ) {
    const searchResultsUpdatedMessages = ['Search results updated.'];

    if (sortTerm && sortDirection) {
      const sortLabel = fieldToLabelMap[sortTerm] || sortTerm;
      const sortDirectionEnglish = SearchUtility.sortDirectionToEnglish(sortDirection);
      searchResultsUpdatedMessages.push(`Sort by ${sortLabel}, ${sortDirectionEnglish}.`);
    }

    // see MatPaginatorIntl.getRangeLabel
    if (length === 0 || pageSize === 0) {
      searchResultsUpdatedMessages.push(`Showing 0 items of ${length}.`);
    } else {
      length = Math.max(length, 0);

      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      searchResultsUpdatedMessages.push(`Showing items ${startIndex + 1} to ${endIndex} of ${length}.`);
    }

    return searchResultsUpdatedMessages.join(' ');
  }

  private configureTableColumns(pageConfig: SearchPageConfig): { [id: string]: string } {
    const fieldLabelMap: { [id: string]: string } = {};

    this.displayedColumns = ['id'];

    if (pageConfig.displayDocumentLabelField) {
      this.displayedColumns.push('label');
    }

    for (const field of pageConfig.fieldsToDisplay) {
      this.displayedColumns.push(field.key);
      fieldLabelMap[field.key] = field.label;
    }

    this.matSortService.sortButtonLabel = id => {
      const label = fieldLabelMap[id] || id;

      return `Change sorting for ${label}`;
    };

    return fieldLabelMap;
  }

  getValueFromMetadata(metadata, key: string) {
    return ObjectUtilities.getNestedObjectFromStringPath(metadata, key);
  }

  isFieldRightAligned(field: Field): boolean {
    return isFieldRightAligned(field);
  }

  onPageEvent(pageEvent: PageEvent) {
    const searchPagination = new SearchPagination(pageEvent.pageIndex, pageEvent.pageSize);
    this.searchModel.pagination = searchPagination;
    this.search.emit(this.searchModel);
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  navigateToEdit(event, pagePath): void {
    if (event.view.getSelection().type !== 'Range') {
      this.router.navigate(['../edit/' + pagePath], { relativeTo: this.route, queryParamsHandling: 'merge' });
    }
  }

  /*
   * Called to ensure that the sorting arrows reflect the actual sort of the search
   */
  private initializeSort(sort: any) {
    const defaultSort = !isNullOrUndefined(this.pageConfig) ? this.pageConfig.defaultSort : undefined;
    if (!isNullOrUndefined(sort) && !isNullOrUndefined(sort.term)) {
      this.sortTerm = sort.term;
    } else if (!isNullOrUndefined(defaultSort) && !isNullOrUndefined(defaultSort.term)) {
      this.sortTerm = defaultSort.term;
    }
    if (!isNullOrUndefined(sort) && !isNullOrUndefined(sort.order)) {
      this.sortDirection = SearchUtility.castSortDirection(sort.order);
    } else if (!isNullOrUndefined(defaultSort) && !isNullOrUndefined(defaultSort.order)) {
      this.sortDirection = SearchUtility.castSortDirection(defaultSort.order);
    }
  }
}
