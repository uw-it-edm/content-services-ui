import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import 'rxjs/add/operator/map';
import { ContentResult } from '../model/content-result';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { UserService } from '../user/user.service';
import { UrlUtilities } from '../util/url-utilities';

@Injectable()
export class ContentService {
  itemPathFragment = '/item/';
  filePathFragment = '/file/';
  baseUrl = environment.content_api.url + environment.content_api.context;

  constructor(private http: Http, private userService: UserService) {}

  public read(itemId: string): Observable<ContentResult> {
    const url = this.baseUrl + this.itemPathFragment + itemId;
    const options = this.buildRequestOptions();

    console.log('Reading content URL:', url);
    return this.http.get(url, options).map(response => {
      console.log('content response: ' + JSON.stringify(response));
      const contentResult: ContentResult = response.json();
      return contentResult;
    }); // TODO: look more into what this should be doing, with the subscribe
    // TODO: handle failure?
  }

  public getFileUrl(itemId: string, webViewable: boolean): string {
    const urlParameters: string[] = [];
    if (webViewable) {
      urlParameters.push('rendition=Web');
    }
    if (environment.content_api.authenticationHeader) {
      const user = this.userService.getUser();
      urlParameters.push('x-uw-act-as=' + user.actAs);
    }
    const url = this.baseUrl + this.filePathFragment + itemId + UrlUtilities.generateUrlParameterString(urlParameters);
    console.log('file url: ', url);

    return url;
  }

  // TODO: copied from SearchSerice
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
}
