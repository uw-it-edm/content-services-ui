import { Injectable } from '@angular/core';
import { Config } from '../model/config';

@Injectable()
export class ConfigService {
  configs: Map<string, Config>;

  constructor() {

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
          "pageName": "google search page"
        },
        "tab-search": {
          "pageName": "tab search page"
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
}
