import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
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

@Injectable()
export class SearchService {
  baseUrl = environment.search_api.url + environment.search_api.context;

  constructor(private http: Http, private userService: UserService) {}

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
    const searchPayload = this.buildSearchPayload(term, pageConfig);
    const options = this.buildRequestOptions();

    console.log('searching with ' + JSON.stringify(searchPayload));
    return this.http.post(this.baseUrl + 'documents-facilities', searchPayload, options).map(response => {
      return this.convertSearchApiResultsToSearchResults(response.json());
    });
  }

  private buildRequestOptions() {
    const requestOptionsArgs = <RequestOptionsArgs>{};
    if (environment.search_api.authenticationHeader) {
      const user = this.userService.getUser();

      const authenticationHeaders = new Headers();
      authenticationHeaders.append(environment.search_api.authenticationHeader, user.actAs);

      requestOptionsArgs.headers = authenticationHeaders;
    }
    return new RequestOptions(requestOptionsArgs);
  }

  private buildSearchPayload(term: SearchModel, pageConfig: PageConfig) {
    const searchPayload = {
      query: term.stringQuery
    };

    this.addFacetsToSearchPayload(searchPayload, pageConfig);
    this.addFiltersToSearchPayload(searchPayload, term);
    this.addPaginationToSearchPayload(searchPayload, term);
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
}
