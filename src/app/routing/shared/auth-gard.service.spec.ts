import { AuthGardService } from './auth-gard.service';
import { UserService } from '../../user/shared/user.service';
import { Observable } from 'rxjs/Observable';

describe('AuthGardService', () => {
  let authGuardService: AuthGardService;

  it('should return true when user is authenticated', () => {
    const userService = new UserService(null, null, null);
    const stubValue = Observable.of(true);
    const spy = spyOn(userService, 'getAuthenticatedObservable').and.returnValue(stubValue);

    authGuardService = new AuthGardService(null, userService);

    expect(authGuardService.canActivate(null, null)).toBeTruthy();
  });
});
