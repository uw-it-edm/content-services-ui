import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../user/shared/user.service';

@Injectable()
export class AuthGardService implements CanActivate, CanActivateChild {
  constructor(private router: Router, private userService: UserService) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.canActivate(route, state);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.userService.getAuthenticatedUser().then(authenticatedUser => {
      if (authenticatedUser) {
        // logged in so return true
        return true;
      }

      // not logged in so redirect to login page with the return url
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });

      return false;
    });
  }
}
