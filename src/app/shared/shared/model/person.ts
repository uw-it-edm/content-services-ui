import { SearchFilterableResult } from './search-filterable-result';
import { PersonResourceConfig } from '../../../core/shared/model/person-resource-config';

export class FilterableValue {
  get value(): string {
    return this._value;
  }

  get displayValue(): string {
    return this._displayValue;
  }

  constructor(value: string, displayValue?: string) {
    this._value = value;
    this._displayValue = displayValue;
  }

  private readonly _value: string;
  private readonly _displayValue?: string;
}

export class Person implements SearchFilterableResult {
  public regId: string;
  public priorRegIds: string[];
  public displayName: string;
  public email?: string;
  public registeredFirstName: string;
  public preferredFirstName: string;
  public registeredLastName: string;
  public registeredName: string;
  public preferredLastName: string;
  public netId: string;
  public employeeId?: string;

  constructor() {}

  static convertToDisplayName(person: Person, options: PersonResourceConfig = {}) {
    if (options.displayRegisteredName) {
      return `${person.registeredName} (${person.employeeId})`;
    }

    return person.getLastName() + ', ' + person.getFirstName() + ' (' + person.employeeId + ')';
  }

  getNameAndEmployeeId(options: PersonResourceConfig = {}): string {
    if (options.displayRegisteredName) {
      return `${this.registeredName} (${this.employeeId})`;
    }

    return this.getLastName() + ', ' + this.getFirstName() + ' (' + this.employeeId + ')';
  }

  getLastName(): string {
    if (this.preferredLastName) {
      return this.preferredLastName;
    } else {
      return this.registeredLastName;
    }
  }

  getFirstName(): string {
    if (this.preferredFirstName) {
      return this.preferredFirstName;
    } else {
      return this.registeredFirstName;
    }
  }

  getFilterableValue(options: PersonResourceConfig = {}): FilterableValue {
    return new FilterableValue(
      this.regId + (this.priorRegIds.length === 0 ? '' : ';' + this.priorRegIds.join(';')),
      this.getNameAndEmployeeId(options)
    );
  }

  getFilterableDisplay(options: PersonResourceConfig = {}): string {
    return this.getNameAndEmployeeId(options);
  }
}
