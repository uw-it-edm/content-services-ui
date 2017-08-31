import { Injectable } from '@angular/core';
import { Config } from '../model/config';

@Injectable()
export class ConfigService {
  configs: Map<string, Config>;

  constructor() {
    this.load();
  }

  load() {
    console.log('init config ');
    const facilitiesConfig: Config = JSON.parse(`
    {
      "tenant": "Facilities",
      "appName": "Facilities app",
      "pages": {
        "google-search": {
          "pageName": "my search page"
        }
      }
    }`);

    const demoConfig: Config = JSON.parse(`
    {
      "tenant": "Demo",
      "appName": "My demo app",
      "pages": {
        "google-search": {
          "pageName": "google search page",
          "fieldsToDisplay" : ["name","latest"],
           "secondSearchBox": true,
           "editPageConfig": {
              "fieldsToDisplay" : ["CategoryId","ProfileId","OriginalFileName","PublishStatus"],
              "viewPanel": true
           }
        },
        "tab-search": {
          "pageName": "tab search page",
          "fieldsToDisplay" : ["latest","name"],
          "secondSearchBox": false
        }
      }
    }`);

    const configs = new Map<string, Config>();

    configs.set('demo', demoConfig);
    configs.set('facilities', facilitiesConfig);

    this.configs = configs;
  }

  getConfigForTenant(tenant: string): Promise<Config> {
    console.log('loading for ' + tenant);

    return Promise.resolve(this.configs.get(tenant));
  }

  getTenantList(): Promise<string[]> {
    return Promise.resolve(Array.from(this.configs.keys()));
  }
}
