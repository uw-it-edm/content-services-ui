import { SearchFilter } from './search-filter';
import { PaginatorConfig } from './paginator-config';

export class SearchModel {
  stringQuery: string;
  filters: SearchFilter[] = [];
  pagination: PaginatorConfig = new PaginatorConfig();
}
