import { inject, TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { User } from './user';
import { Http, HttpModule, ResponseOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [UserService, { provide: Http, useValue: new Http(null, null) }]
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
    inject([UserService, Http], (service: UserService, http: Http) => {
      const httpSpy = spyOn(http, 'get').and.callFake(function(_url, _options) {
        return Observable.of(
          new Response(
            new ResponseOptions({
              body: JSON.stringify({
                userName: 'myusername',
                accounts: {
                  'test-account': 'rwd'
                }
              }),
              status: 200
            })
          )
        );
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
