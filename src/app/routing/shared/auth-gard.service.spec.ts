import { AuthGardService } from './auth-gard.service';
import { UserService } from '../../user/shared/user.service';
import { of } from 'rxjs';

describe('AuthGardService', () => {
  let authGuardService: AuthGardService;

  it('should return true when user is authenticated', () => {
    const userService = new UserService(null, null, null);
    const stubValue = of(true);
    const spy = spyOn(userService, 'getAuthenticatedObservable').and.returnValue(stubValue);

    authGuardService = new AuthGardService(null, userService);

    expect(authGuardService.canActivate(null, null)).toBeTruthy();
  });
});
