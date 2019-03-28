export class ParentFieldConfig {
  get parentType(): string {
    return this._parentType;
  }

  set parentType(value: string) {
    this._parentType = value;
  }

  get key(): string {
    return this._key;
  }

  set key(value: string) {
    this._key = value;
  }

  private _key: string;
  private _parentType: string;
}
