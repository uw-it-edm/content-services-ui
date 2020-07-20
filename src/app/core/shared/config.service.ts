import { Observable, of } from 'rxjs';

import { map, publishReplay, refCount, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Config } from './model/config';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProgressService } from '../../shared/providers/progress.service';
import { UserService } from '../../user/shared/user.service';
import { TenantConfigInfo } from './model/tenant-config-info';
import { Field } from './model/field';
import { PageConfig } from './model/page-config';

@Injectable()
export class ConfigService {
  private configs: Map<string, Config> = new Map();
  private tenantsConfig = null;

  private appConfigUrl = environment.profile_api.url + environment.profile_api.context + '/app/' + environment.profile_api.app_name;

  constructor(private http: HttpClient, private progressService: ProgressService, private userService: UserService) {}

  getConfigForTenant(requestedTenant: string): Promise<Config> {
    this.progressService.start('query');
    return this.getTenantList()
      .toPromise()
      .then(
        (tenants) => {
          this.progressService.end();
          const tenantInfo = tenants.find((tenantInList) => {
            return tenantInList.tenantName === requestedTenant;
          });
          if (tenantInfo) {
            return this.retrieveConfig(tenantInfo);
          } else {
            return Promise.reject('No such tenant : ' + requestedTenant);
          }
        },
        (err) => {
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
          tap((config) => this.configs.set(tenantInfo.tenantName, this.buildConfig(config))),
          publishReplay(1),
          refCount()
        )
        .toPromise();
    }
  }

  private buildConfig(config: Config) {
    const availableFieldsMap = new Map<string, Field>();
    if (config.availableFields) {
      config.availableFields.map((value) => availableFieldsMap.set(value.key, value));

      Object.keys(config.pages).forEach((pageKey) => {
        const pageConfig: PageConfig = config.pages[pageKey];

        if (!pageConfig.fieldsToDisplay) {
          pageConfig.fieldsToDisplay = [];
        }

        if (pageConfig.fieldKeysToDisplay) {
          pageConfig.fieldKeysToDisplay.forEach((field) => {
            if (!availableFieldsMap.has(field)) {
              throw new Error('No Such field : ' + field);
            }
            pageConfig.fieldsToDisplay.push(availableFieldsMap.get(field));
          });
        }

        if (pageConfig.fieldOverrides) {
          pageConfig.fieldOverrides.forEach((fieldOverride) => {
            const fieldIndex = pageConfig.fieldsToDisplay.findIndex((field) => field.key === fieldOverride.key);

            if (fieldIndex >= 0) {
              const fieldConfig = pageConfig.fieldsToDisplay[fieldIndex];
              pageConfig.fieldsToDisplay[fieldIndex] = Object.assign({}, fieldConfig, fieldOverride.override);
            }
          });
        }
      });
    }

    return config;
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
        map((result) => {
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
        tap((tenantsConfig) => {
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
      requestOptionsArgs['headers'] = new HttpHeaders().append(environment.profile_api.authenticationHeader, user.actAs);
    }

    return requestOptionsArgs;
  }
}
