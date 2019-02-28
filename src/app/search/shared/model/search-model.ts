import { SearchFilter } from './search-filter';
import { Sort } from './sort';
import { isNullOrUndefined } from '../../../core/util/node-utilities';
import { SearchPagination } from './search-pagination';

export class SearchModel {
  get filters(): SearchFilter[] {
    return this._filters;
  }

  stringQuery: string;
  private _filters: SearchFilter[] = [];
  pagination: SearchPagination = new SearchPagination();
  order: Sort = new Sort();

  public static fromJson(rawSearchModel): SearchModel {
    const searchModel = new SearchModel();

    const json = JSON.parse(rawSearchModel);

    if (json.stringQuery != null) {
      searchModel.stringQuery = json.stringQuery;
    }

    if (json._filters != null) {
      json._filters.forEach(function(filter) {
        searchModel.addFilterIfNotThere(new SearchFilter(filter.key, filter.value, filter.label, filter.displayValue));
      });
    }

    if (json.pagination != null) {
      console.log(
        'got pagination , page index : ' + json.pagination.pageIndex + ' page size :' + json.pagination.pageSize
      );
      const searchPagination = new SearchPagination();
      searchPagination.pageIndex = json.pagination.pageIndex;
      searchPagination.pageSize = json.pagination.pageSize;
      searchModel.pagination = searchPagination;
    }
    if (json.order != null) {
      console.log('got order ' + json.order.term + ' ' + json.order.order);
      searchModel.order = new Sort(json.order.term, json.order.order);
    }
    return searchModel;
  }

  addFilterIfNotThere(newFilter: SearchFilter): void {
    if (!this._filters.find(filter => filter.equals(newFilter))) {
      this._filters.push(newFilter);
    }
  }

  addOrReplaceFilterForKey(newFilter: SearchFilter): void {
    this.removeFilterForKey(newFilter.key);
    this._filters.push(newFilter);
  }

  removeFilter(filterToRemove: SearchFilter): void {
    this._filters = this._filters.filter(oldFilter => !oldFilter.equals(filterToRemove));
  }

  removeFilterForKey(keyToRemove: String) {
    this._filters = this._filters.filter(oldFilter => !(oldFilter.key === keyToRemove));
  }

  hasFilterForKey(key: String): boolean {
    return !isNullOrUndefined(this._filters.find(filter => filter.key === key));
  }
}
