import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SearchModel } from '../model/search/search-model';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import { SearchResults } from '../model/search-result';
import 'rxjs/add/observable/from';
import { environment } from '../../environments/environment';
import { UserService } from '../user/user.service';
import { SearchFilter } from '../model/search/search-filter';
import { PageConfig } from '../model/config/page-config';
import { FacetConfig } from '../model/config/facet-config';

@Injectable()
export class SearchService {
  baseUrl = environment.search_api.url + environment.search_api.context;

  constructor(private http: Http, private userService: UserService) {}

  search(terms: Observable<SearchModel>, pageConfig: PageConfig): Observable<SearchResults> {
    return terms
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(term => {
        console.log('received search request');
        return this.searchEntries(term, pageConfig);
      });
  }

  searchEntries(term: SearchModel, pageConfig: PageConfig): Observable<SearchResults> {
    const searchPayload = this.buildSearchPayload(term, pageConfig);

    const user = this.userService.getUser();

    const authenticationHeaders = new Headers();
    authenticationHeaders.append(environment.search_api.authenticationHeader, user.actAs);

    const options = new RequestOptions({ headers: authenticationHeaders });

    console.log('searching with ' + JSON.stringify(searchPayload));
    return this.http.post(this.baseUrl + 'documents-facilities', searchPayload, options).map(res => {
      const results = new SearchResults();
      const apiResult = res.json();

      results.total = apiResult['totalCount'];
      if (apiResult['searchResults']) {
        results.results = apiResult['searchResults'];
      }
      this.addFacetToSearchResults(results, apiResult);

      return results;
    });
  }

  private buildSearchPayload(term: SearchModel, pageConfig: PageConfig) {
    const searchPayload = {
      query: term.stringQuery
    };

    this.addFacetsToSearchPayload(searchPayload, pageConfig);
    this.addFiltersToSearchPayload(searchPayload, term);
    return searchPayload;
  }

  private addFacetToSearchResults(results: SearchResults, apiResult: any) {
    if (apiResult['facets']) {
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
