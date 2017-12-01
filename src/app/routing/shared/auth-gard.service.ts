import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../user/shared/user.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGardService implements CanActivate, CanActivateChild {
  constructor(private router: Router, private userService: UserService) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(route, state);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const authentication = this.userService.getAuthenticatedObservable();
    authentication.subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      }
    });
    return authentication;
  }
}
