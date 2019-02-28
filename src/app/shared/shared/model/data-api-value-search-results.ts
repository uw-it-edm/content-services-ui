import { DataApiValue } from './data-api-value';

export class DataApiValueSearchResults {
  content: DataApiValue[] = [];
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  sort: string;
  totalElements: number;
  totalPages: number;
}
