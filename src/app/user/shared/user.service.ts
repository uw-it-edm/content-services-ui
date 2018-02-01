import { Injectable } from '@angular/core';
import { User } from './user';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProgressService } from '../../shared/providers/progress.service';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { NotificationService } from '../../shared/providers/notification.service';

@Injectable()
export class UserService {
  private baseUrl: String = environment.content_api.url + environment.content_api.contextV4;

  private loggedIn$ = new ReplaySubject<boolean>();
  private user: User;
  private user$ = new ReplaySubject<User>();

  constructor(
    private http: HttpClient,
    private progressService: ProgressService,
    private notificationService: NotificationService
  ) {}

  getAuthenticatedObservable(): Observable<boolean> {
    return this.loggedIn$;
  }

  getUser(): User {
    return this.user;
  }

  getUserObservable(): Observable<User> {
    const options = this.buildRequestOptions();
    if (this.progressService != null) {
      this.progressService.start('query');
    }
    this.http.get<User>(this.baseUrl + '/user', options).subscribe(
      user => {
        user.actAs = user.userName;
        this.user = user;
        if (this.progressService != null) {
          this.progressService.end();
        }
        this.user$.next(user);
        this.loggedIn$.next(true);
      },
      () => {
        this.notificationService.error('Cannot load user');
        this.loggedIn$.next(false);
        if (this.progressService != null) {
          this.progressService.end();
        }
      }
    );
    return this.user$;
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
