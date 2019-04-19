import { ParentFieldConfig } from './parent-field-config';

export class DynamicSelectConfig {
  private _type: string;
  private _labelPath: string;
  private _parentFieldConfig?: ParentFieldConfig;

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
  get parentFieldConfig(): ParentFieldConfig {
    return this._parentFieldConfig;
  }

  set parentFieldConfig(value: ParentFieldConfig) {
    this._parentFieldConfig = value;
  }
}
