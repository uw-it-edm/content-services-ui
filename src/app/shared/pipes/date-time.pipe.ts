import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateTime'
})
export class DateTimePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: number, fieldType?): string {
    if (value) {
      let format = 'short';
      if (fieldType === 'date') {
        format = 'shortDate';
      }
      return this.datePipe.transform(new Date(value), format);
    }
  }
}
