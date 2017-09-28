import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import 'rxjs/add/operator/map';
import { ContentItem } from './model/content-item';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { UserService } from '../../user/shared/user.service';
import { UrlUtilities } from '../../core/util/url-utilities';
import { isNullOrUndefined } from 'util';

@Injectable()
export class ContentService {
  itemPathFragment = '/item/';
  filePathFragment = '/file/';
  baseUrl = environment.content_api.url + environment.content_api.context;

  constructor(private http: Http, private userService: UserService) {}

  public read(itemId: string): Observable<ContentItem> {
    const url: string = this.baseUrl + this.itemPathFragment + itemId;
    const options: RequestOptions = this.buildRequestOptions();

    return this.http.get(url, options).map(response => {
      return response.json();
    }); // TODO: handle failure
  }

  public update(contentItem: ContentItem, file?: File): Observable<ContentItem> {
    console.log('Updating: ' + JSON.stringify(contentItem));
    const url: string = this.baseUrl + this.itemPathFragment + contentItem.id;
    const options: RequestOptions = this.buildRequestOptions();

    const formData: FormData = new FormData();
    if (!isNullOrUndefined(file)) {
      formData.append('attachment', file);

      // update revisionId
      let revisionId: number = Number(contentItem.metadata['RevisionId']);
      revisionId += 1;
      contentItem.metadata['RevisionId'] = revisionId;
    }
    const blob: Blob = new Blob([JSON.stringify(contentItem)], { type: 'application/json' });
    formData.append('document', blob);

    return this.http.post(url, formData, options).map(response => {
      return response.json();
    }); // TODO: handle failure
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

    return url;
  }

  // TODO: copied from SearchSerice
  private buildRequestOptions() {
    const requestOptionsArgs = <RequestOptionsArgs>{};
    if (environment.content_api.authenticationHeader) {
      const user = this.userService.getUser();

      const authenticationHeaders = new Headers();
      authenticationHeaders.append(environment.content_api.authenticationHeader, user.actAs);

      requestOptionsArgs.headers = authenticationHeaders;
    }
    return new RequestOptions(requestOptionsArgs);
  }
}
