import { FacetsConfig } from './facets-config';
import { SearchConfig } from './search-config';
import { Field } from './field';
import { PageConfig } from './page-config';
import { Sort } from '../../../search/shared/model/sort';

export class SearchPageConfig implements PageConfig {
  pageName: string;
  theme: string;
  fieldsToDisplay: Array<Field> = [];
  displayDocumentLabelField: boolean;

  facetsConfig: FacetsConfig = new FacetsConfig();
  searchConfig: SearchConfig = new SearchConfig();
  defaultSort: Sort = new Sort();
}
