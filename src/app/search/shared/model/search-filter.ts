import { isDefined } from '@angular/compiler/src/util';

export class SearchFilter {
  key: string;
  value: string;
  label: string;

  constructor(key: string, value: string, label: string) {
    this.key = key;
    this.value = value;
    this.label = label;
  }

  equals(b: SearchFilter): boolean {
    if (!b) {
      return false;
    }
    return this.key === b.key && this.value === b.value;
  }
}
