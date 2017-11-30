import { inject, TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { User } from './user';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [UserService, { provide: HttpClient, useValue: new HttpClient(null) }]
    });
  });

  it(
    'should be created',
    inject([UserService], (service: UserService) => {
      expect(service).toBeTruthy();
    })
  );

  it(
    'should return a user named myusername',
    inject([UserService, HttpClient], (service: UserService, http: HttpClient) => {
      const httpSpy = spyOn(http, 'get').and.callFake(function(_url, _options) {
        return Observable.of({
          userName: 'myusername',
          accounts: {
            'test-account': 'rwd'
          }
        });
      });

      const authenticatedUserPromise: Promise<User> = service.getAuthenticatedUser();

      authenticatedUserPromise.then(authenticatedUser => {
        expect(authenticatedUser.actAs).toBe('myusername');
        expect(authenticatedUser.userName).toBe('myusername');
        expect(authenticatedUser.accounts['test-account']).toBe('rwd');
      });
    })
  );
});
