import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Observable, Subject } from 'rxjs';
import { SearchDataSource } from '../shared/model/search-datasource.model';
import { ResultRow } from '../shared/model/result-row';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortHeaderIntl, Sort, SortDirection } from '@angular/material/sort';
import { PaginatorConfig } from '../shared/model/paginator-config';
import { DataService } from '../../shared/providers/data.service';
import { SearchUtility } from '../shared/search-utility';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { SearchPagination } from '../shared/model/search-pagination';
import { delay, takeUntil, map, tap, debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ObjectUtilities } from '../../core/util/object-utilities';
import { Field, isFieldRightAligned } from '../../core/shared/model/field';

const selectionColumnKey = 'checked';
const idColumnKey = 'id';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  private _pageConfig: SearchPageConfig;
  private fieldToLabelMap: { [id: string]: string } = {};
  private _resultRows: ResultRow[] = [];

  searchModel: SearchModel = new SearchModel();
  paginatorConfig: PaginatorConfig = new PaginatorConfig();
  selection = new SelectionModel<ResultRow>(true /* multi-select */, [] /* initial selections */);

  dataSource: SearchDataSource;
  displayedColumns = [];
  hasResults = false;

  // It seems to be necessary to data-bind these to the mat-table instead of just manipulating
  // the existing MatSort ViewChild because of how Angular times the rendering of the sort arrows
  // and orders its digestion of events
  sortTerm: string;
  sortDirection: SortDirection;

  @Input()
  searchModel$: Observable<SearchModel> = new Observable<SearchModel>();
  @Input()
  searchResults$: Subject<SearchResults>;

  /**
   * Whether to prevent the loaded results from being modified. Disables sorting, paging and navigation.
   */
  @Input()
  freezeResults = false;

  @Output()
  search = new EventEmitter<SearchModel>();
  @Output()
  selectRows = new EventEmitter<ResultRow[]>();

  @Input()
  set pageConfig(config: SearchPageConfig) {
    this._pageConfig = config;
    this.fieldToLabelMap = this.configureTableColumns(config);
  }

  get pageConfig(): SearchPageConfig {
    return this._pageConfig;
  }

  /**
   * Whether to allow rows to be selected (selections are emitted to 'selectRows' output).
   */
  @Input()
  set selectionEnabled(enableSelection: boolean) {
    if (enableSelection && !this.selectionEnabled) {
      this.selection.clear();
      this.displayedColumns.splice(0, 0, selectionColumnKey);
    } else if (!enableSelection && this.selectionEnabled) {
      this.displayedColumns.splice(0, 1);
    }
  }

  get selectionEnabled(): boolean {
    return this.displayedColumns && this.displayedColumns.length > 0 && this.displayedColumns[0] === selectionColumnKey;
  }

  @ViewChild(MatPaginator, { static: true })
  topPaginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true })
  bottomPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true })
  sort: MatSort = new MatSort();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data: DataService,
    private liveAnnouncer: LiveAnnouncer,
    private matSortService: MatSortHeaderIntl
  ) {}

  ngOnInit(): void {
    const searchResultRows$ = this.searchResults$.pipe(
      map(results => results.results),
      tap(rows => this._resultRows = rows),
      takeUntil(this.componentDestroyed)
    );

    this.dataSource = new SearchDataSource(this.searchModel$, searchResultRows$, this.sort);

    this.selection.changed.pipe(debounceTime(100), takeUntil(this.componentDestroyed)).subscribe(() => {
      this.selectRows.emit(this.selection.selected);
    });

    // delay 0 to prevent "Expression has changed after it was checked" when initial search is performed afterViewInit in parent
    this.searchModel$.pipe(delay(0), takeUntil(this.componentDestroyed)).subscribe((searchModel) => {
      this.onSearchModelChanged(searchModel);
    });

    this.searchResults$.pipe(takeUntil(this.componentDestroyed)).subscribe((results) => {
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

    const adjacentIds = results.results.map((result) => result['id']); // store a list of result ids to be passed to edit page
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

    this.displayedColumns = this.selectionEnabled ? [selectionColumnKey, idColumnKey] : [idColumnKey];

    if (pageConfig.displayDocumentLabelField) {
      this.displayedColumns.push('label');
    }

    for (const field of pageConfig.fieldsToDisplay) {
      this.displayedColumns.push(field.key);
      fieldLabelMap[field.key] = field.label;
    }

    this.matSortService.sortButtonLabel = (id) => {
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
    if (!this.freezeResults && event && event.view && event.view.getSelection().type !== 'Range') {
      this.router.navigate(['../edit/' + pagePath], { relativeTo: this.route, queryParamsHandling: 'merge' });
    }
  }

  toggleSelectAll() {
    if (this.areAllRowsSelected()) {
      this.selection.clear();
    } else {
      this._resultRows.forEach(row => this.selection.select(row));
    }
  }

  areAllRowsSelected() {
    return this.selection.hasValue() && this.selection.selected.length === this._resultRows.length;
  }

  areSomeRowsSelected() {
    return this.selection.hasValue() && !this.areAllRowsSelected();
  }

  getHeaderSelectionLabel(): string {
    if (this.areAllRowsSelected()) {
      return `All ${this._resultRows.length} rows selected`;
    } else if (this.areSomeRowsSelected()) {
      return `${this.selection.selected.length} rows selected`;
    } else {
      return 'No rows selected';
    }
  }

  getHeaderSelectionAction(): string {
    return this.areAllRowsSelected() ? 'Unselect all rows' : 'Select all rows';
  }

  getSelectionLabelForRow(row: ResultRow): string {
    return this.selection.isSelected(row) ? `Row selected ${row.id}` : `Row unselected ${row.id}`;
  }

  getSelectionActionRow(row: ResultRow): string {
    return this.selection.isSelected(row) ? `Unselect row ${row.id}` : `Select row ${row.id}`;
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
