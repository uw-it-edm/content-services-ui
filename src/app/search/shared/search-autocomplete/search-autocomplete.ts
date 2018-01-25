import { SearchFilter } from '../model/search-filter';

export interface SearchAutocomplete {
  autocomplete(query: string);

  createFilter(value: string): SearchFilter;
}
