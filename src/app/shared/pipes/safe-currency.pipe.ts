import { Pipe } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

/* tslint:disable:use-pipe-transform-interface */
@Pipe({ name: 'safeCurrency' })
export class SafeCurrencyPipe extends CurrencyPipe {
  transform(value: any, currencyCode?: string, display?: any, digitsInfo?: string, locale?: string): string {
    try {
      return super.transform(value, currencyCode, display, digitsInfo, locale);
    } catch {
      return value;
    }
  }
}
