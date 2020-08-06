import { SearchFilterableResult } from './search-filterable-result';
import { FilterableValue } from './person';
import { PersonResourceConfig } from '../../../core/shared/model/person-resource-config';

export class Student implements SearchFilterableResult {
  public birthdate?;
  public displayName: string;
  public registeredName: string;
  public email?: string;
  public firstName: string;
  public lastName: string;
  public netId: string;
  public studentNumber: string;
  public studentSystemKey: string;

  constructor() {}

  static convertToDisplayName(student: Student, options: PersonResourceConfig = {}) {
    if (options.displayRegisteredName) {
      return `${student.registeredName} (${student.studentNumber})`;
    }

    return student.lastName + ', ' + student.firstName + ' (' + student.studentNumber + ')';
  }

  getNameAndStudentId(options: PersonResourceConfig = {}): string {
    if (options.displayRegisteredName) {
      return `${this.registeredName} (${this.studentNumber})`;
    }

    return this.lastName + ', ' + this.firstName + ' (' + this.studentNumber + ')';
  }

  getFilterableValue(options: PersonResourceConfig = {}): FilterableValue {
    return new FilterableValue(this.studentNumber, this.getNameAndStudentId(options));
  }

  getFilterableDisplay(options: PersonResourceConfig = {}): string {
    return options.displayRegisteredName ? this.registeredName : this.displayName;
  }
}
