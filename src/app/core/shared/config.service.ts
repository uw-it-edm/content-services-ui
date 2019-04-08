import { Observable, of } from 'rxjs';

import { map, publishReplay, refCount, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Config } from './model/config';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProgressService } from '../../shared/providers/progress.service';
import { UserService } from '../../user/shared/user.service';
import { TenantConfigInfo } from './model/tenant-config-info';

@Injectable()
export class ConfigService {
  private configs: Map<string, Config> = new Map();
  private tenantsConfig = null;

  private appConfigUrl =
    environment.profile_api.url + environment.profile_api.context + '/app/' + environment.profile_api.app_name;

  constructor(private http: HttpClient, private progressService: ProgressService, private userService: UserService) {}

  getConfigForTenant(requestedTenant: string): Promise<Config> {
    this.progressService.start('query');
    return this.getTenantList()
      .toPromise()
      .then(
        tenants => {
          this.progressService.end();
          const tenantInfo = tenants.find(tenantInList => {
            return tenantInList.tenantName === requestedTenant;
          });
          if (tenantInfo) {
            return this.retrieveConfig(tenantInfo);
          } else {
            return Promise.reject('No such tenant : ' + requestedTenant);
          }
        },
        err => {
          this.progressService.end();
          return Promise.reject(err);
        }
      );
  }

  getSupportEmail(): string {
    return environment.supportEmail;
  }

  private retrieveConfig(tenantInfo: TenantConfigInfo): Promise<Config> {
    if (this.configs.has(tenantInfo.tenantName)) {
      console.log('getConfigForTenant from cache');
      return Promise.resolve(this.configs.get(tenantInfo.tenantName));
    } else {
      console.log('getConfigForTenant');
      const requestOptions = this.buildRequestOptions();
      return this.http
        .get<Config>(tenantInfo.downloadUrl, requestOptions)
        .pipe(
          tap(config => this.configs.set(tenantInfo.tenantName, config)),
          publishReplay(1),
          refCount()
        )
        .toPromise();
    }
  }

  getTenantList(): Observable<TenantConfigInfo[]> {
    if (this.tenantsConfig !== null) {
      console.log('getTenantList from cache');
      this.progressService.end();
      return of(this.tenantsConfig);
    } else {
      console.log('getTenantList');
      const requestOptions = this.buildRequestOptions();
      return this.http.get(this.appConfigUrl, requestOptions).pipe(
        map(result => {
          const tenants: TenantConfigInfo[] = [];

          const tenantsFromAPI = result['_links'];
          if (tenantsFromAPI) {
            for (const tenantName in tenantsFromAPI) {
              if (tenantsFromAPI.hasOwnProperty(tenantName)) {
                const tenantConfigInfo = new TenantConfigInfo(tenantName, tenantsFromAPI[tenantName]['href']);

                tenants.push(tenantConfigInfo);
              }
            }
          }

          return tenants.sort((a: TenantConfigInfo, b: TenantConfigInfo) => {
            return a.tenantName.localeCompare(b.tenantName);
          });
        }),
        tap(tenantsConfig => {
          this.tenantsConfig = tenantsConfig;
        }),
        publishReplay(1),
        refCount()
      );
    }
  }

  private buildRequestOptions() {
    const requestOptionsArgs = {};
    if (environment.profile_api.authenticationHeader) {
      const user = this.userService.getUser();
      requestOptionsArgs['headers'] = new HttpHeaders().append(
        environment.profile_api.authenticationHeader,
        user.actAs
      );
    }

    return requestOptionsArgs;
  }
}
