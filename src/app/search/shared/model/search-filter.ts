export class SearchFilter {
  key: string;
  value: string;
  label: string;
  displayValue?: string;

  constructor(key: string, value: string, label: string, displayValue?: string) {
    this.key = key;
    this.label = label;
    this.value = value;
    this.displayValue = displayValue;
  }

  equals(b: SearchFilter): boolean {
    if (!b) {
      return false;
    }
    return this.key === b.key && this.value === b.value;
  }

  getDisplayValue(): string {
    if (this.displayValue) {
      return this.displayValue;
    } else {
      return this.value;
    }
  }
}
