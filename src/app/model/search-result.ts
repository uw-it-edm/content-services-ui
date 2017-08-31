import { ResultRow } from './result-row';
import { Facet } from './facet';

export class SearchResults {
  results: ResultRow[] = [];
  facets: Map<string, Facet>;
  total: number;

  constructor() {
    this.facets = new Map<string, Facet>();
  }
}
