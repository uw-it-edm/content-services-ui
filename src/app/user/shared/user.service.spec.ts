import { inject, TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { User } from './user';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpClientModule } from '@angular/common/http';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
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
      const user = new User('myusername');
      user.accounts = new Map();
      user.accounts['test-account'] = 'rwd';
      const httpSpy = spyOn(http, 'get').and.callFake(function(_url, _options) {
        return Observable.of(user);
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
