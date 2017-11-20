import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { ContentItem } from './model/content-item';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { UserService } from '../../user/shared/user.service';
import { UrlUtilities } from '../../core/util/url-utilities';
import { isNullOrUndefined } from 'util';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ContentService {
  itemPathFragment = '/item/';
  filePathFragment = '/file/';
  baseUrl = environment.content_api.url + environment.content_api.contextV3;

  constructor(private http: HttpClient, private userService: UserService) {}

  public read(itemId: string): Observable<ContentItem> {
    const url: string = this.baseUrl + this.itemPathFragment + itemId;
    const options = this.buildRequestOptions();

    return this.http.get<ContentItem>(url, options); // TODO: handle failure
  }

  public update(contentItem: ContentItem, file?: File): Observable<ContentItem> {
    console.log('Updating: ' + JSON.stringify(contentItem));
    const url: string = this.baseUrl + this.itemPathFragment + contentItem.id;

    const formData: FormData = new FormData();
    if (!isNullOrUndefined(file)) {
      formData.append('attachment', file);

      let revisionId: number = Number(contentItem.metadata['RevisionId']);
      revisionId += 1;
      contentItem.metadata['RevisionId'] = revisionId;
    }

    return this.createOrUpdate(formData, contentItem, url);
  }

  public create(contentItem: ContentItem, file: File): Observable<ContentItem> {
    console.log('Creating: ' + JSON.stringify(contentItem));
    const url: string = this.baseUrl + this.itemPathFragment;

    const formData: FormData = new FormData();
    formData.append('attachment', file);
    contentItem.metadata['RevisionId'] = 1; // initial revisionId

    return this.createOrUpdate(formData, contentItem, url);
  }

  private createOrUpdate(formData: FormData, contentItem: ContentItem, url: string) {
    const options = this.buildRequestOptions();
    const blob: Blob = new Blob([JSON.stringify(contentItem)], { type: 'application/json' });
    formData.append('document', blob);

    return this.http.post<ContentItem>(url, formData, options); // TODO: handle failure
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
    if (environment.content_api.authenticationHeader) {
      const user = this.userService.getUser();
      requestOptionsArgs['headers'] = new HttpHeaders().append(
        environment.content_api.authenticationHeader,
        user.actAs
      );
    }

    return requestOptionsArgs;
  }
}
