import { SearchFilter } from './search-filter';
import { PaginatorConfig } from './paginator-config';
import { Sort } from './sort';
import { isNullOrUndefined } from '../../../core/util/node-utilities';

export class SearchModel {
  stringQuery: string;
  private _filters: SearchFilter[] = [];
  pagination: PaginatorConfig = new PaginatorConfig();
  order: Sort = new Sort();

  get filters(): SearchFilter[] {
    return this._filters;
  }

  addFilterIfNotThere(newFilter: SearchFilter): void {
    if (!this._filters.find(filter => filter.equals(newFilter))) {
      this._filters.push(newFilter);
    }
  }

  removeFilter(filterToRemove: SearchFilter): void {
    this._filters = this._filters.filter(oldFilter => !oldFilter.equals(filterToRemove));
  }

  hasFilterForKey(key: String): boolean {
    return !isNullOrUndefined(this._filters.find(filter => filter.key === key));
  }
}
