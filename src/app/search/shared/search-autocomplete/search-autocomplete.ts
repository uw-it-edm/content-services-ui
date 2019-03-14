import { SearchFilter } from '../model/search-filter';
import { FilterableValue } from '../../../shared/shared/model/person';

export interface SearchAutocomplete {
  autocomplete(query: string);

  createFilter(value: FilterableValue): SearchFilter;
}
