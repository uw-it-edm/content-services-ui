export class SearchFilter {
  key: string;
  value: string;
  label: string;
  valueLabel?: string;

  constructor(key: string, value: string, label: string, valueLabel?: string) {
    this.key = key;
    this.label = label;
    this.value = value;
    this.valueLabel = valueLabel;
  }

  equals(b: SearchFilter): boolean {
    if (!b) {
      return false;
    }
    return this.key === b.key && this.value === b.value;
  }

  getDisplayValue(): string {
    if (this.valueLabel) {
      return this.valueLabel;
    } else {
      return this.value;
    }
  }
}
