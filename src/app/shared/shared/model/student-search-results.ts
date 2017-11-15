import { Student } from './student';

export class StudentSearchResults {
  content: Student[] = [];
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  sort: string;
  totalElements: number;
  totalPages: number;
}
