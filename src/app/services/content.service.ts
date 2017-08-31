import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { ContentResult } from '../model/content-result';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ContentService {
  actAs = 'agagne'; // TODO: this shouldn't be hardcoded
  baseUrl = 'http://localhost:11000/content/'; // TODO: this should be resolved from an environment variable
  queryUrl = 'v3/item/';

  constructor(private http: Http) {}

  public read(itemId: string): Observable<ContentResult> {
    console.log('looking up item: ' + itemId);
    const url = this.baseUrl + this.queryUrl + itemId;
    console.log('URL:', url);
    return this.http.get(url, this.options()).map(res => {
      console.log('result ' + JSON.stringify(res));
      const contentResult: ContentResult = res.json();
      return contentResult;
    }); // TODO: look more into what this should be doing, with the subscribe
    // TODO: handle failure?
  }

  // TODO: do i need this stuff?
  private options(queryParams?: URLSearchParams): RequestOptions {
    const headers = new Headers({ 'Content-Type': 'application/json', 'x-uw-act-as': this.actAs }); // ... Set content type to JSON
    const options = new RequestOptions({ headers: headers, search: queryParams }); // Create a request option

    return options;
  }
}
