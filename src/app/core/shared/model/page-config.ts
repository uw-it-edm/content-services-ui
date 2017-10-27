import { FacetsConfig } from './facets-config';
import { EditPageConfig } from './edit-page-config';
import { SearchConfig } from './search-config';
import { Field } from './field';

export class PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<Field> = [];

  facetsConfig: FacetsConfig = new FacetsConfig();
  editPageConfig: EditPageConfig = new EditPageConfig();
  searchConfig: SearchConfig = new SearchConfig();
}
