import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SearchModel } from '../../model/search/search-model';
import { SearchResults } from '../../model/search-result';
import { PageConfig } from '../../model/config/page-config';
import { Observable } from 'rxjs/Observable';
import { SearchDataSource } from '../../model/search/search-datasource.model';
import { MdPaginator } from '@angular/material';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  searchModel: SearchModel = new SearchModel();

  dataSource: SearchDataSource;
  displayedColumns = ['id', 'label'];

  @Input() searchModel$: Observable<SearchModel>;
  @Input() searchResults$: Observable<SearchResults>;
  @Input() pageConfig: PageConfig;
  @Output() search = new EventEmitter<SearchModel>();

  @ViewChild(MdPaginator) paginator: MdPaginator;

  ngOnDestroy(): void {
    console.log('destroy search component');
  }

  ngOnInit(): void {
    this.searchModel$.subscribe(searchModel => {
      this.searchModel = searchModel;
    });
    this.dataSource = new SearchDataSource(this.searchResults$, this.paginator);

    for (const field of this.pageConfig.fieldsToDisplay) {
      this.displayedColumns.push(field);
    }
  }
}
