import { SearchFilterableResult } from './search-filterable-result';

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

  getFilterableValue(): string {
    return this.studentNumber;
  }

  getFilterableDisplay(): string {
    return this.displayName;
  }
}
