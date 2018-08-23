import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import { SearchResults } from './search-result';
import { ResultRow } from './result-row';
import { MatPaginator, MatSort, SortDirection } from '@angular/material';
import { SearchModel } from './search-model';
import { isNullOrUndefined } from '../../../core/util/node-utilities';

export class SearchDataSource extends DataSource<ResultRow> {
  constructor(
    private searchModel$: Observable<SearchModel>,
    private searchResults$: Observable<SearchResults>,
    private sort: MatSort,
    private paginators: Array<MatPaginator>
  ) {
    super();
    searchModel$.subscribe(searchModel => {
      if (!isNullOrUndefined(searchModel)) {
        const newSort = searchModel.order;
        let newSortDirection: SortDirection = '';
        if (newSort.order === 'asc') {
          newSortDirection = 'asc';
        } else if (newSort.order === 'desc') {
          newSortDirection = 'desc';
        }
        this.sort.active = newSort.term;
        this.sort.direction = newSortDirection;
      }
    });
  }

  connect(): Observable<ResultRow[]> {
    return this.searchResults$.map(response => response.results);
  }

  disconnect() {}
}
