import { Injectable } from '@angular/core';
import { Config } from './model/config';
import { Headers, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TenantConfigInfo } from './model/tenant-config-info';
import { UserService } from '../../user/shared/user.service';
import { ProgressService } from '../../shared/providers/progress.service';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class ConfigService {
  private configs: Map<string, Config> = new Map();
  private tenantsConfig = null;

  private appConfigBaseUrl = environment.profile_api.url + environment.profile_api.context;

  constructor(private http: Http, private progressService: ProgressService, private userService: UserService) {}

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

          if (this.configs.has(tenantInfo.tenantName)) {
            console.log('getConfigForTenant from cache');
            return Promise.resolve(this.configs.get(tenantInfo.tenantName));
          } else {
            console.log('getConfigForTenant');
            const requestOptions = this.buildRequestOptions();
            return this.http
              .get(tenantInfo.downloadUrl, requestOptions)
              .map(config => config.json() as Config)
              .do(config => this.configs.set(tenantInfo.tenantName, config))
              .publishReplay(1)
              .refCount()
              .toPromise();
          }
        },
        () => {
          this.progressService.end();
        }
      );
  }

  getTenantList(): Observable<TenantConfigInfo[]> {
    const response$ = new ReplaySubject<TenantConfigInfo[]>();
    this.progressService.start('query');
    if (this.tenantsConfig !== null) {
      console.log('getTenantList from cache');
      this.progressService.end();
      return Observable.of(this.tenantsConfig);
    } else {
      console.log('getTenantList');
      const requestOptions = this.buildRequestOptions();
      const response = this.http
        .get(this.appConfigBaseUrl + '/app/content-services-ui', requestOptions)
        .map(result => result.json())
        .map(result => {
          const tenants: TenantConfigInfo[] = [];

          const tenantsFromAPI = result['_links'];

          for (const tenantName in tenantsFromAPI) {
            if (tenantsFromAPI.hasOwnProperty(tenantName)) {
              const tenantConfigInfo = new TenantConfigInfo(tenantName, tenantsFromAPI[tenantName]['href']);

              tenants.push(tenantConfigInfo);
            }
          }

          return tenants.sort((a: TenantConfigInfo, b: TenantConfigInfo) => {
            return a.tenantName.localeCompare(b.tenantName);
          });
        })
        .do(tenantsConfig => {
          this.tenantsConfig = tenantsConfig;
        })
        .publishReplay(1)
        .refCount();

      response.subscribe(
        tenantsConfig => {
          this.progressService.end();
          response$.next(tenantsConfig);
        },
        err => {
          this.progressService.end();
          response$.error(err);
        }
      );
      return response$;
    }
  }

  private buildRequestOptions() {
    const requestOptionsArgs = <RequestOptionsArgs>{};
    if (environment.profile_api.authenticationHeader) {
      const user = this.userService.getUser();

      const authenticationHeaders = new Headers();
      authenticationHeaders.append(environment.profile_api.authenticationHeader, user.actAs);

      requestOptionsArgs.headers = authenticationHeaders;
    }
    return new RequestOptions(requestOptionsArgs);
  }
}
