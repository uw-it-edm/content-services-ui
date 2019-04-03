import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Observable, Subject } from 'rxjs';
import { SearchDataSource } from '../shared/model/search-datasource.model';
import { MatPaginator, MatSort, PageEvent, Sort, SortDirection } from '@angular/material';
import { PaginatorConfig } from '../shared/model/paginator-config';
import { DataService } from '../../shared/providers/data.service';
import { SearchUtility } from '../shared/search-utility';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { SearchPagination } from '../shared/model/search-pagination';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  searchModel: SearchModel = new SearchModel();
  paginatorConfig: PaginatorConfig = new PaginatorConfig();

  dataSource: SearchDataSource;
  displayedColumns = ['id'];
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
  @Input()
  pageConfig: SearchPageConfig;
  @Output()
  search = new EventEmitter<SearchModel>();

  @ViewChild(MatPaginator)
  topPaginator: MatPaginator;
  @ViewChild(MatPaginator)
  bottomPaginator: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort = new MatSort();

  constructor(private route: ActivatedRoute, private router: Router, private data: DataService) {}

  ngOnInit(): void {
    this.searchModel$.pipe(takeUntil(this.componentDestroyed)).subscribe(searchModel => {
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
    });
    this.dataSource = new SearchDataSource(this.searchModel$, this.searchResults$, this.sort, [
      this.topPaginator,
      this.bottomPaginator
    ]);
    this.searchResults$.pipe(takeUntil(this.componentDestroyed)).subscribe(results => {
      this.hasResults = !isNullOrUndefined(results) && results.total > 0;
      if (this.hasResults) {
        this.paginatorConfig.numberOfResults = results.total;
      }

      const adjacentIds = results.results.map(result => result['id']); // store a list of result ids to be passed to edit page
      this.initializeSort(results.sort);
      this.data.set('adjacentIds', adjacentIds);
    });

    this.configureTableColumns();
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.searchModel.order.order = sort.direction;
      this.searchModel.order.term = sort.active;
      this.search.next(this.searchModel);
    });
  }

  private configureTableColumns() {
    if (this.pageConfig.displayDocumentLabelField) {
      this.displayedColumns.push('label');
    }
    for (const field of this.pageConfig.fieldsToDisplay) {
      this.displayedColumns.push(field.key);
    }
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

  navigateToEdit(pagePath): void {
    this.router.navigate(['../edit/' + pagePath], { relativeTo: this.route, queryParamsHandling: 'merge' });
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
