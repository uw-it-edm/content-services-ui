import { Injectable } from '@angular/core';
import { Config } from './model/config';
import { Http } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class ConfigService {
  private configs: Map<string, Config> = new Map();
  private tenantsConfig = null;
  private listTenantsUrl = 'https://api.github.com/repos/uw-it-edm/content-services-ui-config/contents/' +
    environment.config_environment;

  constructor(private http: Http, private httpclient: HttpClient) {
  }

  getConfigForTenant(requestedTenant: string): Promise<Config> {
    return this.getTenantList()
      .toPromise()
      .then(tenants => {
        const tenantInfo = tenants.find(tenantInList => {
          return tenantInList.tenantName === requestedTenant;
        });

        if (this.configs.has(tenantInfo.tenantName)) {
          console.log('getConfigForTenant from cache');
          return Promise.resolve(this.configs.get(tenantInfo.tenantName));
        } else {
          console.log('getConfigForTenant');
          return this.httpclient
            .get<Config>(tenantInfo.downloadUrl)
            .do(config => this.configs.set(tenantInfo.tenantName, config))
            .publishReplay(1)
            .refCount()
            .toPromise();
        }
      });
  }

  getTenantList(): Observable<any[]> {
    if (this.tenantsConfig !== null) {
      console.log('getTenantList from cache');
      return Observable.of(this.tenantsConfig);
    } else {
      console.log('getTenantList');
      return this.http
        .get(this.listTenantsUrl)
        .map(result => result.json())
        .map(result => {
          const tenants = [];

          result.forEach(entry => {
            tenants.push({
              tenantName: entry['name'].replace('.json', ''),
              downloadUrl: entry['download_url']
            });
          });

          return tenants;
        })
        .do(tenantsConfig => {
          this.tenantsConfig = tenantsConfig;
        })
        .publishReplay(1)
        .refCount();
    }
  }
}
