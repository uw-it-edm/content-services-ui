import { Injectable } from '@angular/core';
import { Config } from './model/config';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProgressService } from '../../shared/providers/progress.service';
import { UserService } from '../../user/shared/user.service';
import { Observable } from 'rxjs/Observable';
import { TenantConfigInfo } from './model/tenant-config-info';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/publishReplay';

@Injectable()
export class ConfigService {
  private configs: Map<string, Config> = new Map();
  private tenantsConfig = null;

  private appConfigBaseUrl = environment.profile_api.url + environment.profile_api.context;

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

          if (this.configs.has(tenantInfo.tenantName)) {
            console.log('getConfigForTenant from cache');
            return Promise.resolve(this.configs.get(tenantInfo.tenantName));
          } else {
            console.log('getConfigForTenant');
            const requestOptions = this.buildRequestOptions();
            return this.http
              .get<Config>(tenantInfo.downloadUrl, requestOptions)
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
    if (this.tenantsConfig !== null) {
      console.log('getTenantList from cache');
      this.progressService.end();
      return Observable.of(this.tenantsConfig);
    } else {
      console.log('getTenantList');
      const requestOptions = this.buildRequestOptions();
      return this.http
        .get(this.appConfigBaseUrl + '/app/content-services-ui', requestOptions)
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
