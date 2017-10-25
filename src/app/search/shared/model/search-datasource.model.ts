import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { SearchResults } from './search-result';
import { ResultRow } from './result-row';
import { MatPaginator } from '@angular/material';

export class SearchDataSource extends DataSource<ResultRow> {
  constructor(private searchResults$: Observable<SearchResults>, private paginators: Array<MatPaginator>) {
    super();
  }

  connect(): Observable<ResultRow[]> {
    return this.searchResults$.map(response => response.results);
  }

  disconnect() {}
}
