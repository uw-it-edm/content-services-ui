import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchModel } from './model/search-model';

import { SearchResults } from './model/search-result';

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
import { ActivatedRoute, Params, Router } from '@angular/router';

@Injectable()
export class SearchService {
  baseUrl = environment.search_api.url + environment.search_api.context;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  search(searchModel: SearchModel, pageConfig: SearchPageConfig): Observable<SearchResults> {
    console.log('processing search request');

    if (pageConfig.searchStateInURL) {
      const queryParams: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
      queryParams['s'] = JSON.stringify(searchModel);

      this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
    }

    this.dataService.set('currentSearch', searchModel);

    return this.searchEntries(searchModel, pageConfig);
  }

  private searchEntries(searchModel: SearchModel, pageConfig: SearchPageConfig): Observable<SearchResults> {
    const indexName = pageConfig.searchConfig.indexName;
    const searchPayload = this.buildSearchPayload(searchModel, pageConfig);
    const options = this.buildRequestOptions();

    console.log('searching "' + indexName + '" with ' + JSON.stringify(searchPayload));
    return this.http.post(this.baseUrl + indexName, searchPayload, options).pipe(
      map(response => {
        return this.convertSearchApiResultsToSearchResults(searchModel, response);
      })
    );
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

    if (!isNullOrUndefined(pageConfig.facetsConfig)) {
      Object.keys(pageConfig.facetsConfig.facets)
        .map(key => {
          return pageConfig.facetsConfig.facets[key];
        })
        .forEach((facetConfig: FacetConfig) => {
          facets.push({
            field: facetConfig.key,
            order: facetConfig.order,
            size: facetConfig.maxSize && facetConfig.maxSize > facetConfig.size ? facetConfig.maxSize : facetConfig.size
          });
        });
    }
    searchPayload['facets'] = facets;
  }

  private addSortToSearchPayload(searchPayload: any, sort: Sort, pageConfig: SearchPageConfig) {
    if (isNullOrUndefined(sort) || isNullOrUndefined(sort.term) || isNullOrUndefined(sort.order)) {
      sort = pageConfig.defaultSort;
    }
    if (pageConfig.fieldsToDisplay && sort && sort.term && sort.order) {
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
        } else {
          // Assume default datatype is string
          newSort.term += '.lowercase';
        }
      }

      searchPayload['searchOrder'] = newSort;
    }
  }
}
