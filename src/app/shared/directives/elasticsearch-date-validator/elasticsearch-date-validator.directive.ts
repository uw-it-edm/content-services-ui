import { Directive } from '@angular/core';
import { FormControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { isNullOrUndefined } from '../../../core/util/node-utilities';

@Directive({
  selector: '[appElasticSearchDateValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ElasticsearchDateValidatorDirective, multi: true }]
})
export class ElasticsearchDateValidatorDirective implements Validator {
  static readonly minDate = new Date(1653, 0, 1);
  static readonly maxDate = new Date(2285, 11, 31);

  static validateTimestamp(control: FormControl): ValidationErrors {
    const timestamp: number = control.value;

    const isValid =
      isNullOrUndefined(timestamp) ||
      (!isNaN(timestamp) &&
        timestamp >= ElasticsearchDateValidatorDirective.minDate.getTime() &&
        timestamp <= ElasticsearchDateValidatorDirective.maxDate.getTime());
    const message = {
      years: {
        message:
          'The year must be a valid date between ' +
          ElasticsearchDateValidatorDirective.minDate.getFullYear() +
          ' and ' +
          ElasticsearchDateValidatorDirective.maxDate.getFullYear()
      }
    };
    return isValid ? null : message;
  }

  constructor() {}

  validate(control: FormControl): ValidationErrors {
    return ElasticsearchDateValidatorDirective.validateTimestamp(control);
  }
}
