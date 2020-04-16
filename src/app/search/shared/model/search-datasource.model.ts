import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';

import { SearchResults } from './search-result';
import { ResultRow } from './result-row';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { SearchModel } from './search-model';
import { isNullOrUndefined } from '../../../core/util/node-utilities';
import { map } from 'rxjs/operators';

export class SearchDataSource extends DataSource<ResultRow> {
  constructor(
    private searchModel$: Observable<SearchModel>,
    private searchResults$: Observable<SearchResults>,
    private sort: MatSort,
    private paginators: Array<MatPaginator>
  ) {
    super();
    searchModel$.subscribe((searchModel) => {
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
    return this.searchResults$.pipe(map((response) => response.results));
  }

  disconnect() {}
}
