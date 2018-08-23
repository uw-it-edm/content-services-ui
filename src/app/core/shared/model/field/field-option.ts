import { isNullOrUndefined } from '../../../util/node-utilities';

export class FieldOption {
  private _value: string;
  private _displayValue: string;

  constructor(value?: string, displayValue?: string) {
    this._value = value;
    this._displayValue = displayValue;
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
  }

  get displayValue(): string {
    if (isNullOrUndefined(this._displayValue) || '' === this._displayValue) {
      return this.value;
    }
    return this._displayValue;
  }

  set displayValue(value: string) {
    this._displayValue = value;
  }
}
