import { Injectable } from '@angular/core';
import { ConfigService } from '../../core/shared/config.service';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Config, CustomTextItem } from '../../core/shared/model/config';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { NotificationService } from '../../shared/providers/notification.service';
import { ApplicationStateService } from '../../shared/providers/application-state.service';

@Injectable()
export class ConfigResolver implements Resolve<Config> {
  customText$ = new ReplaySubject<Map<string, CustomTextItem>>();
  appName$ = new Subject<string>();

  constructor(
    private configService: ConfigService,
    private router: Router,
    private notificationService: NotificationService,
    private appStateService: ApplicationStateService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Config> {
    let tenant: string = route.params.tenant;

    if (!tenant) {
      // Try to find a tenant param in the parent routes
      while (!tenant && route.parent) {
        tenant = route.parent.params.tenant;
        route = route.parent;
      }
    }

    tenant = tenant.toLowerCase();

    console.log('resolving for ' + tenant);

    return this.configService
      .getConfigForTenant(tenant)
      .then((config) => {
        if (config) {
          console.log('returning ' + config);
          this.customText$.next(config.customText);
          this.appName$.next(this.getAppName(config));
          this.appStateService.setWarningHeaderMessage(config?.warningHeaderMessage);
          return config;
        } else {
          console.log('no config for ' + tenant);
          // config not found
          this.redirectToHome();
          return null;
        }
      })
      .catch((err) => {
        this.notificationService.error('Cannot load configuration', err);
        this.redirectToHome();
        return null;
      });
  }

  private redirectToHome() {
    this.customText$.next(null);
    this.appName$.next('');
    this.router.navigate(['/']);
  }

  private getAppName(config) {
    if (config.appName) {
      return config.appName;
    } else {
      return config.tenant;
    }
  }

  getAppNameSubject(): Observable<string> {
    return this.appName$;
  }

  getCustomTextSubject(): Observable<Map<string, CustomTextItem>> {
    return this.customText$;
  }
}
