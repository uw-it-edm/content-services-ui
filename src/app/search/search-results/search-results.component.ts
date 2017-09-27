import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { PageConfig } from '../../core/shared/model/page-config';
import { Observable } from 'rxjs/Observable';
import { SearchDataSource } from '../shared/model/search-datasource.model';
import { MdPaginator, PageEvent } from '@angular/material';
import { isNullOrUndefined } from 'util';
import { PaginatorConfig } from '../shared/model/paginator-config';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  searchModel: SearchModel = new SearchModel();
  paginatorConfig: PaginatorConfig = new PaginatorConfig();

  dataSource: SearchDataSource;
  displayedColumns = ['id', 'label'];
  hasResults = false;

  @Input() searchModel$: Observable<SearchModel>;
  @Input() searchResults$: Observable<SearchResults>;
  @Input() pageConfig: PageConfig;
  @Output() search = new EventEmitter<SearchModel>();

  @ViewChild(MdPaginator) topPaginator: MdPaginator;
  @ViewChild(MdPaginator) bottomPaginator: MdPaginator;

  ngOnDestroy(): void {
    console.log('destroy search component');
  }

  ngOnInit(): void {
    this.searchModel$.subscribe(searchModel => {
      this.searchModel = searchModel;
    });
    this.dataSource = new SearchDataSource(this.searchResults$, [this.topPaginator, this.bottomPaginator]);
    this.searchResults$.subscribe(results => {
      this.hasResults = !isNullOrUndefined(results) && results.total > 0;
      if (this.hasResults) {
        this.paginatorConfig.numberOfResults = results.total;
      }
    });
    for (const field of this.pageConfig.fieldsToDisplay) {
      this.displayedColumns.push(field);
    }
  }

  onPageEvent(pageEvent: PageEvent) {
    this.paginatorConfig.pageSize = pageEvent.pageSize;
    this.paginatorConfig.pageIndex = pageEvent.pageIndex;
    this.searchModel.pagination = this.paginatorConfig;
    this.search.emit(this.searchModel);
  }
}
