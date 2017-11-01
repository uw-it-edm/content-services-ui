import { FacetsConfig } from './facets-config';
import { ContentPageConfig } from './content-page-config';
import { SearchConfig } from './search-config';
import { Field } from './field';

export class PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<Field> = [];

  facetsConfig: FacetsConfig = new FacetsConfig();
  editPageConfig: ContentPageConfig = new ContentPageConfig();
  createPageConfig: ContentPageConfig = new ContentPageConfig();
  searchConfig: SearchConfig = new SearchConfig();
}
