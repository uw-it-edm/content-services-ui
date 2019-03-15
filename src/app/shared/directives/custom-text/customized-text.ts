export class CustomizedText {
  get isCustom(): boolean {
    return this._custom;
  }

  get label(): string {
    return this._label;
  }

  get description(): string {
    return this._description;
  }

  constructor(label: string, description: string, custom: boolean) {
    this._label = label;
    this._description = description;
    this._custom = custom;
  }

  private readonly _description: string;
  private readonly _label: string;
  private readonly _custom: boolean;
}
