import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SearchModel } from './model/search-model';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import { SearchResults } from './model/search-result';
import 'rxjs/add/observable/from';
import { environment } from '../../../environments/environment';
import { UserService } from '../../user/shared/user.service';
import { SearchFilter } from './model/search-filter';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { FacetConfig } from '../../core/shared/model/facet-config';
import { Sort } from './model/sort';
import { Field } from '../../core/shared/model/field';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../../shared/providers/data.service';
import { isNullOrUndefined } from '../../core/util/node-utilities';

@Injectable()
export class SearchService {
  baseUrl = environment.search_api.url + environment.search_api.context;

  constructor(private http: HttpClient, private userService: UserService, private dataService: DataService) {}

  search(searchModel$: Observable<SearchModel>, pageConfig: SearchPageConfig): Observable<SearchResults> {
    return searchModel$
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(searchModel => {
        console.log('processing search request');

        this.dataService.set('currentSearch', searchModel);

        return this.searchEntries(searchModel, pageConfig);
      });
  }

  private searchEntries(searchModel: SearchModel, pageConfig: SearchPageConfig): Observable<SearchResults> {
    const indexName = pageConfig.searchConfig.indexName;
    const searchPayload = this.buildSearchPayload(searchModel, pageConfig);
    const options = this.buildRequestOptions();

    console.log('searching "' + indexName + '" with ' + JSON.stringify(searchPayload));
    return this.http.post(this.baseUrl + indexName, searchPayload, options).map(response => {
      return this.convertSearchApiResultsToSearchResults(searchModel, response);
    });
  }

  private buildRequestOptions() {
    const requestOptionsArgs = {};
    if (environment.search_api.authenticationHeader) {
      const user = this.userService.getUser();
      requestOptionsArgs['headers'] = new HttpHeaders().append(environment.search_api.authenticationHeader, user.actAs);
    }

    return requestOptionsArgs;
  }

  private buildSearchPayload(term: SearchModel, pageConfig: SearchPageConfig) {
    const searchPayload = {
      query: term.stringQuery
    };

    this.addFacetsToSearchPayload(searchPayload, pageConfig);
    this.addFiltersToSearchPayload(searchPayload, term);
    this.addPaginationToSearchPayload(searchPayload, term);
    this.addSortToSearchPayload(searchPayload, term.order, pageConfig);
    return searchPayload;
  }

  convertSearchApiResultsToSearchResults(searchModel: SearchModel, apiResult: any) {
    const results = new SearchResults(searchModel.order);

    if (apiResult !== null) {
      if ('totalCount' in apiResult) {
        results.total = apiResult['totalCount'];
      }

      if ('searchResults' in apiResult) {
        results.results = apiResult['searchResults'];
      }

      this.addFacetToSearchResults(results, apiResult);
    }
    return results;
  }

  private addFacetToSearchResults(results: SearchResults, apiResult: any) {
    if ('facets' in apiResult) {
      apiResult['facets'].forEach(facet => {
        results.facets.set(facet['name'], facet);
      });
    }
  }

  private addFiltersToSearchPayload(searchPayload: any, term: SearchModel) {
    const filters = [];

    term.filters.forEach((filter: SearchFilter) => {
      filters.push({
        field: filter.key,
        term: filter.value
      });
    });

    searchPayload['filters'] = filters;
  }

  private addPaginationToSearchPayload(searchPayload: any, term: SearchModel) {
    searchPayload['from'] = term.pagination.pageSize * term.pagination.pageIndex;
    searchPayload['page'] = term.pagination.pageIndex;
    searchPayload['pageSize'] = term.pagination.pageSize;
  }

  private addFacetsToSearchPayload(searchPayload: any, pageConfig: SearchPageConfig) {
    const facets = [];

    Object.keys(pageConfig.facetsConfig.facets)
      .map(key => {
        return pageConfig.facetsConfig.facets[key];
      })
      .forEach((facetConfig: FacetConfig) => {
        facets.push({
          field: facetConfig.key,
          order: facetConfig.order,
          size: facetConfig.size
        });
      });

    searchPayload['facets'] = facets;
  }

  private addSortToSearchPayload(searchPayload: any, sort: Sort, pageConfig: SearchPageConfig) {
    if (isNullOrUndefined(sort) || isNullOrUndefined(sort.term) || isNullOrUndefined(sort.order)) {
      sort = pageConfig.defaultSort;
    }
    if (sort && sort.term && sort.order) {
      const newSort: Sort = Object.assign(new Sort(), sort);
      const fieldConfig: Field = pageConfig.fieldsToDisplay.find(field => field.key === newSort.term);

      if (newSort.term !== 'id' && newSort.term !== 'label') {
        newSort.term = 'metadata.' + newSort.term;
      } else if (newSort.term !== 'id') {
        newSort.term += '.lowercase';
      }

      if (fieldConfig) {
        if (fieldConfig.dataType) {
          if (fieldConfig.dataType === 'string' && !fieldConfig.key.endsWith('Date')) {
            newSort.term += '.lowercase';
          } else if (fieldConfig.dataType === 'number') {
            // NOOP
          } else if (fieldConfig.dataType === 'date') {
            // NOOP
          }
        }
      }

      searchPayload['searchOrder'] = newSort;
    }
  }
}
