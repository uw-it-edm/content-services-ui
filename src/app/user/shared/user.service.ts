import { Injectable } from '@angular/core';
import { User } from './user';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class UserService {
  private loggedUser;

  private contentApiBaseUrl: String = environment.content_api.url + environment.content_api.contextV4;

  constructor(private http: HttpClient) {}

  getAuthenticatedUser(): Promise<User> {
    const options = this.buildRequestOptions();

    return this.http
      .get<User>(this.contentApiBaseUrl + '/user', options)
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
    const requestOptionsArgs = {};
    if (environment.content_api.authenticationHeader && environment.testUser) {
      requestOptionsArgs['headers'] = new HttpHeaders().append(
        environment.content_api.authenticationHeader,
        environment.testUser
      );
    }
    return requestOptionsArgs;
  }
}
