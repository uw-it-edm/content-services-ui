import { FilterableValue } from './person';

export interface SearchFilterableResult {
  getFilterableValue(options?: any): FilterableValue;
  getFilterableDisplay(options?: any): string;
}
