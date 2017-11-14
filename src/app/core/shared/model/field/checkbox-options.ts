export class CheckboxOptions {
  private _checkedValue: string;
  private _uncheckedValue?: string;

  get checkedValue(): string {
    return this._checkedValue;
  }

  set checkedValue(value: string) {
    this._checkedValue = value;
  }

  get uncheckedValue(): string {
    return this._uncheckedValue;
  }

  set uncheckedValue(value: string) {
    this._uncheckedValue = value;
  }
}
