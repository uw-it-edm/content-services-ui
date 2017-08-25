import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SearchModel } from '../model/search-model';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import { SearchResults } from '../model/search-result';
import { ResultRow } from '../model/result-row';
import 'rxjs/add/observable/from';


@Injectable()
export class SearchService {


  baseUrl = 'https://api.cdnjs.com/libraries';
  queryUrl = '?search=';

  constructor(private http: Http) {
  }


  search(terms: Observable<SearchModel>): Observable<SearchResults> {

    return terms
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(term => {
        console.log('received search request');
        return this.searchEntries(term);
      });
  }

  searchEntries(term: SearchModel): Observable<SearchResults> {
    console.log('search entries');
    return this.http
      .get(this.baseUrl + this.queryUrl + term.stringQuery)
      .map(res => {
        const apiResult = res.json();
        console.log('result ' + JSON.stringify(apiResult));

        const results = new SearchResults();
        results.total = apiResult['total'];
        const resultRows = apiResult['results'] as any[];
        results.results = resultRows.map(row => {
          const resultRow = new ResultRow();

          Object.keys(row).forEach(fieldName => {
            resultRow.metadata[fieldName] = row[fieldName];
          });

          return resultRow;
        });
        return results;
      });
  }
}
