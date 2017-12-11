import { Injectable } from '@angular/core';
import { ConfigService } from '../../core/shared/config.service';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Config, CustomTextItem } from '../../core/shared/model/config';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ConfigResolver implements Resolve<Config> {
  customText$ = new ReplaySubject<Map<string, CustomTextItem>>();
  appName$ = new Subject<string>();

  constructor(private configService: ConfigService, private router: Router) {}

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

    return this.configService.getConfigForTenant(tenant).then(config => {
      if (config) {
        console.log('returning ' + config);
        this.customText$.next(config.customText);
        this.appName$.next(this.getAppName(config));
        return config;
      } else {
        // config not found
        this.customText$.next(null);
        this.appName$.next('');
        this.router.navigate(['/']);
        return null;
      }
    });
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
