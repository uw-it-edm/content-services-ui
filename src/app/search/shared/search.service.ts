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
import { PageConfig } from '../../core/shared/model/page-config';
import { FacetConfig } from '../../core/shared/model/facet-config';
import { SearchOrder } from './model/search-order';
import { Field } from '../../core/shared/model/field';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SearchService {
  baseUrl = environment.search_api.url + environment.search_api.context;

  constructor(private http: HttpClient, private userService: UserService) {}

  search(terms: Observable<SearchModel>, pageConfig: PageConfig): Observable<SearchResults> {
    return terms
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(term => {
        console.log('processing search request');
        return this.searchEntries(term, pageConfig);
      });
  }

  private searchEntries(term: SearchModel, pageConfig: PageConfig): Observable<SearchResults> {
    const indexName = pageConfig.searchConfig.indexName;
    const searchPayload = this.buildSearchPayload(term, pageConfig);
    const options = this.buildRequestOptions();

    console.log('searching "' + indexName + '" with ' + JSON.stringify(searchPayload));
    return this.http.post(this.baseUrl + indexName, searchPayload, options).map(response => {
      return this.convertSearchApiResultsToSearchResults(response);
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

  private buildSearchPayload(term: SearchModel, pageConfig: PageConfig) {
    const searchPayload = {
      query: term.stringQuery
    };

    this.addFacetsToSearchPayload(searchPayload, pageConfig);
    this.addFiltersToSearchPayload(searchPayload, term);
    this.addPaginationToSearchPayload(searchPayload, term);
    this.addOrderingToSearchPayload(searchPayload, term.order, pageConfig);
    return searchPayload;
  }

  convertSearchApiResultsToSearchResults(apiResult: any) {
    const results = new SearchResults();

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

  private addFacetsToSearchPayload(searchPayload: any, pageConfig: PageConfig) {
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

  private addOrderingToSearchPayload(searchPayload: any, order: SearchOrder, pageConfig: PageConfig) {
    if (order && order.term && order.order) {
      const newOrder: SearchOrder = Object.assign(new SearchOrder(), order);
      const fieldConfig: Field = pageConfig.fieldsToDisplay.find(field => field.name === newOrder.term);

      if (newOrder.term !== 'id' && newOrder.term !== 'label') {
        newOrder.term = 'metadata.' + newOrder.term;
      } else if (newOrder.term !== 'id') {
        newOrder.term += '.lowercase';
      }

      if (
        fieldConfig &&
        (!fieldConfig.dataType || fieldConfig.dataType === 'string') &&
        !fieldConfig.name.endsWith('Date')
      ) {
        newOrder.term += '.lowercase';
      }

      searchPayload['searchOrder'] = newOrder;
    }
  }
}
