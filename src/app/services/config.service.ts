import { Injectable } from '@angular/core';
import { Config } from '../model/config/config';

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

    const demoConfig: Config = Object.assign(
      new Config(),
      JSON.parse(`
    {
      "tenant": "Demo",
      "appName": "My demo app",
      "pages": {
        "google-search": {
          "pageName": "google search page",
          "fieldsToDisplay" : ["LastModifier", "MimeType"],
           "secondSearchBox": true,
           "facetsConfig":{
             "active": true,
             "facets": {
                "metadata.DocumentType.label.raw": {
                   "key" : "metadata.DocumentType.label.raw",
                   "label" : "Document Type",
                   "order": "desc",
                   "size":5
                 },
                "metadata.DocumentYear": {
                   "key" : "metadata.DocumentYear",
                   "label" : "Document Year",
                   "order": "desc",
                   "size":10
                }
             }
           },
           "editPageConfig": {
              "pageName": "Edit Content Item",
              "fieldsToDisplay" : ["CategoryId","ProfileId","OriginalFileName","PublishStatus","LastModifiedDate"],
              "viewPanel": true
           }
         },
        "tab-search": {
          "pageName": "tab search page",
          "fieldsToDisplay" : ["LastModifier"],
          "secondSearchBox": false
        }
      }
    }`)
    );

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
