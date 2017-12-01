import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { ContentItem } from './model/content-item';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { UserService } from '../../user/shared/user.service';
import { UrlUtilities } from '../../core/util/url-utilities';
import { isNullOrUndefined } from 'util';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContentItemChange } from './model/content-item-change';
import { ProgressService } from '../../shared/providers/progress.service';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class ContentService {
  itemPathFragment = '/item/';
  filePathFragment = '/file/';
  baseUrl = environment.content_api.url + environment.content_api.contextV3;

  constructor(private http: HttpClient, private progressService: ProgressService, private userService: UserService) {}

  public create(item: ContentItem, file: File): Observable<ContentItem> {
    console.log('Creating: ' + JSON.stringify(item));
    const url: string = this.baseUrl + this.itemPathFragment;

    const formData: FormData = new FormData();
    formData.append('attachment', file);
    item.metadata['RevisionId'] = 1; // initial revisionId

    return this.createOrUpdate(formData, item, url);
  }

  public read(itemId: string): Observable<ContentItem> {
    const url: string = this.baseUrl + this.itemPathFragment + itemId;
    const options = this.buildRequestOptions();

    return this.http.get<ContentItem>(url, options); // TODO: handle failure
  }

  public update(item: ContentItem, file: File): Observable<ContentItem> {
    console.log('Updating: ' + JSON.stringify(item));
    const url: string = this.baseUrl + this.itemPathFragment + item.id;

    const formData: FormData = new FormData();
    if (!isNullOrUndefined(file)) {
      formData.append('attachment', file);

      let revisionId: number = Number(item.metadata['RevisionId']);
      revisionId += 1;
      item.metadata['RevisionId'] = revisionId;
    }

    return this.createOrUpdate(formData, item, url);
  }

  private createOrUpdate(formData: FormData, contentItem: ContentItem, url: string): Observable<ContentItem> {
    const options = this.buildRequestOptions();
    const blob: Blob = new Blob([JSON.stringify(contentItem)], { type: 'application/json' });
    formData.append('document', blob);

    if (this.progressService != null) {
      this.progressService.start('indeterminate');
    }
    const response = this.http.post<ContentItem>(url, formData, options);
    const contentItem$ = new ReplaySubject<ContentItem>();
    response.subscribe(
      item => {
        if (this.progressService != null) {
          this.progressService.end();
        }
        contentItem$.next(item);
      },
      err => {
        if (this.progressService != null) {
          this.progressService.end();
        }
        contentItem$.error(err);
      }
    ); // TODO: handle failure
    return contentItem$;
  }

  public getFileUrl(itemId: string, webViewable: boolean, disposition?: string): string {
    const urlParameters: string[] = [];
    if (webViewable) {
      urlParameters.push('rendition=Web');
    }
    if (!isNullOrUndefined(disposition)) {
      urlParameters.push('disposition=' + disposition);
    }
    if (environment.content_api.authenticationHeader) {
      const user = this.userService.getUser();
      urlParameters.push(environment.content_api.authenticationHeader + '=' + user.actAs);
    }
    const url = this.baseUrl + this.filePathFragment + itemId + UrlUtilities.generateUrlParameterString(urlParameters);
    return url;
  }

  private buildRequestOptions() {
    const requestOptionsArgs = {};
    const CONTENT_API = environment.content_api;
    const headers = new HttpHeaders();

    if (CONTENT_API.authenticationHeader) {
      const user = this.userService.getUser();
      requestOptionsArgs['headers'] = new HttpHeaders().append(
        environment.content_api.authenticationHeader,
        user.actAs
      );
    }
    // if (CONTENT_API.headers) {
    //   Object.keys(CONTENT_API.headers).forEach(function (key) {
    //     const value = CONTENT_API.headers[key];
    //     headers.append(key, value);
    //   });
    // }
    // requestOptionsArgs['headers'] = headers;
    return requestOptionsArgs;
  }
}
