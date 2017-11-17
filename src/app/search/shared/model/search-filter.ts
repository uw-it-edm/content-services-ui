import { isDefined } from '@angular/compiler/src/util';

export class SearchFilter {
  key: string;
  value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }

  equals(b: SearchFilter): boolean {
    if (!b) {
      return false;
    }
    return this.key === b.key && this.value === b.value;
  }
}
