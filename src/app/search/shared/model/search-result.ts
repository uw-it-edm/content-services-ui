import { ResultRow } from './result-row';
import { Facet } from './facet';
import { Sort } from './sort';

export class SearchResults {
  results: ResultRow[] = [];
  facets: Map<string, Facet>;
  total: number;
  sort: Sort;

  constructor(sort?: Sort) {
    this.facets = new Map<string, Facet>();
    this.sort = sort;
  }
}
