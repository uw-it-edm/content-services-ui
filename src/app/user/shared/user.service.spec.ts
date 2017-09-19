import { inject, TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import { User } from './user';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService]
    });
  });

  it(
    'should be created',
    inject([UserService], (service: UserService) => {
      expect(service).toBeTruthy();
    })
  );

  it(
    'should return a user named maxime',
    inject([UserService], (service: UserService) => {
      const authenticatedUserPromise: Promise<User> = service.getAuthenticatedUser();

      authenticatedUserPromise.then(authenticatedUser => {
        expect(authenticatedUser.actAs).toBe('maximed');
        expect(authenticatedUser.username).toBe('Maxime Deravet');
      });
    })
  );
});
