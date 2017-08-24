import { AuthGardService } from './auth-gard.service';
import { User } from '../user/user';
import { UserService } from '../user/user.service';

describe('AuthGardService', () => {

  let authGuardService: AuthGardService;

  it('should return true when user is authenticated', () => {
    const fake = {getAuthenticatedUser: () => new User('test name', 'test')};

    const userService = new UserService();
    const stubValue = Promise.resolve(new User('test name', 'test'));
    const spy = spyOn(userService, 'getAuthenticatedUser').and.returnValue(stubValue);


    authGuardService = new AuthGardService(null, userService);


    expect(authGuardService.canActivate(null, null)).toBeTruthy();
  });
});
