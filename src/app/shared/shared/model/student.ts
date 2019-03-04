import { SearchFilterableResult } from './search-filterable-result';
import { FilterableValue } from './person';

export class Student implements SearchFilterableResult {
  public birthdate?;
  public displayName: string;
  public email?: string;
  public firstName: string;
  public lastName: string;
  public netId: string;
  public studentNumber: string;
  public studentSystemKey: string;

  constructor() {}

  static convertToDisplayName(student: Student) {
    return student.lastName + ', ' + student.firstName + ' (' + student.studentNumber + ')';
  }

  getFilterableValue(): FilterableValue {
    return new FilterableValue(this.studentNumber);
  }

  getFilterableDisplay(): string {
    return this.displayName;
  }
}
