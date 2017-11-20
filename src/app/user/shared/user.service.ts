import { Injectable } from '@angular/core';
import { User } from './user';
import { Headers, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {
  private loggedUser;

  private contentApiBaseUrl: String = environment.content_api.url + environment.content_api.contextV4;

  constructor(private http: Http) {}

  getAuthenticatedUser(): Promise<User> {
    const options = this.buildRequestOptions();

    return this.http
      .get(this.contentApiBaseUrl + '/user', options)
      .map(response => response.json())
      .toPromise()
      .then(contentApiUser => {
        contentApiUser.actAs = contentApiUser.userName;
        this.loggedUser = contentApiUser;
        return contentApiUser;
      });
  }

  getUser(): User {
    return this.loggedUser;
  }

  private buildRequestOptions() {
    const requestOptionsArgs = <RequestOptionsArgs>{};
    if (environment.content_api.authenticationHeader && environment.testUser) {
      const authenticationHeaders = new Headers();
      authenticationHeaders.append(environment.content_api.authenticationHeader, environment.testUser);

      requestOptionsArgs.headers = authenticationHeaders;
    }
    return new RequestOptions(requestOptionsArgs);
  }
}
