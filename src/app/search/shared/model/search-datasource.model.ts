import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import { SearchResults } from './search-result';
import { ResultRow } from './result-row';
import { MatPaginator, MatSort } from '@angular/material';

export class SearchDataSource extends DataSource<ResultRow> {
  constructor(
    private searchResults$: Observable<SearchResults>,
    private sort: MatSort,
    private paginators: Array<MatPaginator>
  ) {
    super();
  }

  connect(): Observable<ResultRow[]> {
    return this.searchResults$.map(response => response.results);
  }

  disconnect() {}
}
