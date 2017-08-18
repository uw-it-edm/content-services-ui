import { Injectable } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Config } from '../model/config';

@Injectable()
export class ConfigResolver implements Resolve<Config> {

  constructor(private configService: ConfigService, private router: Router) {
  }

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
        return config;
      } else { // config not found
        this.router.navigate(['/']);
        return null;
      }
    });
  }
}
