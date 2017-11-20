import { SearchFilter } from './search-filter';
import { PaginatorConfig } from './paginator-config';
import { SearchOrder } from './search-order';

export class SearchModel {
  stringQuery: string;
  filters: SearchFilter[] = [];
  pagination: PaginatorConfig = new PaginatorConfig();
  order: SearchOrder = new SearchOrder();
}
