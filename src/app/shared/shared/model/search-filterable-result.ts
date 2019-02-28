import { FilterableValue } from './person';

export interface SearchFilterableResult {
  getFilterableValue(): FilterableValue;
  getFilterableDisplay(): string;
}
