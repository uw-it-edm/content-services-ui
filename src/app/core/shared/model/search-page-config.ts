import { FacetsConfig } from './facets-config';
import { SearchConfig } from './search-config';
import { Field } from './field';
import { PageConfig } from './page-config';
import { Sort } from '../../../search/shared/model/sort';
import { SearchAutocompleteConfig } from './search-autocomplete-config';
import { SearchDaterangeConfig } from './search-daterange-config';

export class SearchPageConfig implements PageConfig {
  pageName: string;
  theme = 'uw-default';
  fieldsToDisplay: Array<Field> = [];
  fieldKeysToDisplay: Array<string> = [];
  displayDocumentLabelField = false;
  enableDisplaySearch = false;

  searchStateInURL = false;
  disableUploadNewDocument = false;

  searchDaterangeConfig: SearchDaterangeConfig = new SearchDaterangeConfig();
  facetsConfig: FacetsConfig = new FacetsConfig();
  searchConfig: SearchConfig = new SearchConfig();
  defaultSort: Sort = new Sort();
  autocompleteConfig: SearchAutocompleteConfig;
}
