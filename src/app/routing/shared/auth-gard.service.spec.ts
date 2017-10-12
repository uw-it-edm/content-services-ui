import { AuthGardService } from './auth-gard.service';
import { User } from '../../user/shared/user';
import { UserService } from '../../user/shared/user.service';

describe('AuthGardService', () => {
  let authGuardService: AuthGardService;

  it('should return true when user is authenticated', () => {
    const fake = { getAuthenticatedUser: () => new User('test') };

    const userService = new UserService(null);
    const stubValue = Promise.resolve(new User('test'));
    const spy = spyOn(userService, 'getAuthenticatedUser').and.returnValue(stubValue);

    authGuardService = new AuthGardService(null, userService);

    expect(authGuardService.canActivate(null, null)).toBeTruthy();
  });
});
