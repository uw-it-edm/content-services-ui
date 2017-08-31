import { FacetsConfig } from './facets-config';
import { EditPageConfig } from './edit-page-config';

export class PageConfig {
  pageName: string;

  fieldsToDisplay: Array<string> = [];

  facetsConfig: FacetsConfig = new FacetsConfig();
  editPageConfig: EditPageConfig = new EditPageConfig();
}
