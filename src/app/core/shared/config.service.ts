import { Injectable } from '@angular/core';
import { Config } from './model/config';

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
          "theme": "uw-default",
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
              "theme": "uw-default",
              "fieldsToDisplay" : ["CategoryId","ProfileId","OriginalFileName","PublishStatus","LastModifiedDate"],
              "viewPanel": true,
              "buttons": [
                {
                  "label": "Delete",
                  "command": "deleteItem"
                },
                {
                  "label": "Publish",
                  "command": "publishItem"
                },
                {
                  "label": "Save",
                  "color": "primary",
                  "command": "saveItem"
                }
              ]
           }
         },
        "tab-search": {
          "pageName": "Demonstration Search",
          "theme": "uw-default",
          "fieldsToDisplay" : ["LastModifier"],
          "editPageConfig": {
              "theme": "uw-default",
              "pageName": "Edit Content Item",
              "fieldsToDisplay" : ["CategoryId","ProfileId","OriginalFileName","PublishStatus"],
              "buttons": [
                {
                  "label": "Delete",
                  "command": "deleteItem"
                },
                {
                  "label": "Publish",
                  "command": "publishItem"
                },
                {
                  "label": "Save",
                  "color": "primary",
                  "command": "saveItem"
                }
              ],
              "viewPanel": true
          },
          "searchConfig": {
              "directions": "Type a budget number, vendor name, amount, or other info",
              "label": "",
              "placeholder": "Search for documents",
              "indexName": "documents-facilities"
          },
          "facetsConfig": {
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
          }
        }
      }
    }`)
    );
    const mechEngProCardConfig: Config = Object.assign(
      new Config(),
      JSON.parse(`
    {
      "tenant": "mech-eng-procard",
      "appName": "Mechanical Engineering: ProCard Receipts",
      "pages": {
        "tab-search": {
          "pageName": "ProCard Receipts",
          "theme": "uw-default",
          "fieldsToDisplay" : ["ProCardHolder","PurchaseDate","Amount","Vendor","BudgetNumber","DocumentSubtype","PublishStatus"],
          "editPageConfig": {
              "theme": "uw-default",
              "pageName": "Edit Content Item",
              "fieldsToDisplay" : ["ReceivedDate","ProCardHolder","Filer","PurchaseDate","DocumentSubtype","Amount","Vendor",
                                  "BudgetNumber","PublishStatus"],
              "buttons": [
                {
                  "label": "Void",
                  "command": "voidItem"
                },
                {
                  "label": "Publish",
                  "command": "publishItem"
                },
                {
                  "label": "Save",
                  "color": "primary",
                  "command": "saveItem"
                }
              ],
              "viewPanel": true
          },
          "searchConfig": {
              "directions": "Type a budget number, vendor name, amount, or other info",
              "label": "",
              "placeholder": "Search for documents",
              "indexName": "documents-procard"
          },
          "facetsConfig": {
             "active": true,
             "facets": {
                "metadata.PublishStatus": {
                   "key" : "metadata.PublishStatus",
                   "label" : "Received",
                   "order": "desc",
                   "size":5
                 },
                "metadata.DocumentSubtype.raw": {
                   "key" : "metadata.DocumentSubtype.raw",
                   "label" : "Document Type",
                   "order": "desc",
                   "size":10
                }
             }
          }
        }
      }
    }`)
    );
    const configs = new Map<string, Config>();

    configs.set('demo', demoConfig);
    configs.set('facilities', facilitiesConfig);
    configs.set('mech-eng-procard', mechEngProCardConfig);

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
