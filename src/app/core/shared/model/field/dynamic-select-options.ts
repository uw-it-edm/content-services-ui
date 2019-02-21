export class DynamicSelectOptions {
  private _type: string;
  private _labelPath: string;

  get labelPath(): string {
    return this._labelPath;
  }

  set labelPath(value: string) {
    this._labelPath = value;
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }
}
