import { FacetsConfig } from './facets-config';
export class PageConfig {
  pageName: string;

  fieldsToDisplay: Array<string> = [];

  facetsConfig: FacetsConfig = new FacetsConfig();
}
