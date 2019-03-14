import { Person } from './person';

export class PersonSearchResults {
  content: Person[] = [];
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  sort: string;
  totalElements: number;
  totalPages: number;
}
