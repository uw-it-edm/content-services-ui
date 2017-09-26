import { FacetsConfig } from './facets-config';
import { EditPageConfig } from './edit-page-config';
import { SearchConfig } from './search-config';

export class PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<string> = [];

  facetsConfig: FacetsConfig = new FacetsConfig();
  editPageConfig: EditPageConfig = new EditPageConfig();
  searchConfig: SearchConfig = new SearchConfig();
}
