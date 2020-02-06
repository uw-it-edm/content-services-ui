import { Injectable } from '@angular/core';
import { ContentItem } from './model/content-item';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserService } from '../../user/shared/user.service';
import { UrlUtilities } from '../../core/util/url-utilities';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProgressService } from '../../shared/providers/progress.service';
import { isNullOrUndefined } from '../../core/util/node-utilities';

@Injectable()
export class ContentService {
  /* TODO: changing searchIndexUpdateDelay to 0 from 3000 so that there is no artificial delay
           if we decide to not make this configurable we should remove the timeout in createOrUpdate */
  searchIndexUpdateDelay = 0; // ms delay for updates to be available in the search-api index
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

    return this.createOrUpdate(formData, item, url, file && file.name);
  }

  public read(itemId: string): Observable<ContentItem> {
    const url: string = this.baseUrl + this.itemPathFragment + itemId;
    const options = this.buildRequestOptions();

    return this.http.get<ContentItem>(url, options);
  }

  public update(item: ContentItem, file: File): Observable<ContentItem> {
    console.log('Updating: ' + JSON.stringify(item));
    const url: string = this.baseUrl + this.itemPathFragment + item.id;

    const formData: FormData = new FormData();
    let filename;
    if (!isNullOrUndefined(file)) {
      filename = file.name;
      formData.append('attachment', file);

      let revisionId: number = Number(item.metadata['RevisionId']);
      revisionId += 1;
      item.metadata['RevisionId'] = revisionId;
    }

    return this.createOrUpdate(formData, item, url);
  }

  private createOrUpdate(
    formData: FormData,
    contentItem: ContentItem,
    url: string,
    filename?: string
  ): Observable<ContentItem> {
    const options = this.buildRequestOptions(filename);
    const blob: Blob = new Blob([JSON.stringify(contentItem)], { type: 'application/json' });
    formData.append('document', blob);

    if (this.progressService != null) {
      this.progressService.start('indeterminate');
    }
    const response = this.http.post<ContentItem>(url, formData, options);
    const contentItem$ = new ReplaySubject<ContentItem>();
    response.subscribe(
      item => {
        setTimeout(() => {
          // Delay notifying the user about a successful update so that the search index is updated
          if (this.progressService != null) {
            this.progressService.end();
          }
          contentItem$.next(item);
        }, this.searchIndexUpdateDelay);
      },
      err => {
        err.item = contentItem;
        err.filename = filename;
        if (this.progressService != null) {
          this.progressService.end();
        }
        contentItem$.error(err);
      }
    );
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

  private buildRequestOptions(filename?: string) {
    const CONTENT_API = environment.content_api;
    let headers = new HttpHeaders();

    if (CONTENT_API.authenticationHeader) {
      const user = this.userService.getUser();
      headers = headers.append(CONTENT_API.authenticationHeader, user.actAs);
    }

    if (!!filename) {
      headers = headers.append('x-uw-attachment', filename);
    }

    return { headers };
  }
}
