import { Directive } from '@angular/core';
import { FormControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { isNullOrUndefined } from '../../../core/util/node-utilities';

@Directive({
  selector: '[appElasticSearchDateValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ElasticsearchDateValidatorDirective, multi: true }]
})
export class ElasticsearchDateValidatorDirective implements Validator {
  /*
   * https://www.elastic.co/guide/en/elasticsearch/reference/2.4/mapping-date-format.html
   * "timestamp allows a max length of 13 chars, so only dates between 1653 and 2286 are supported. "
   * */
  static readonly minDate = new Date(1653, 0, 1);
  static readonly maxDate = new Date(2285, 11, 31);

  static validateControl(control: FormControl): ValidationErrors {
    return ElasticsearchDateValidatorDirective.validateControl(control.value);
  }

  static validateTimestamp(timestamp: number): ValidationErrors {
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
    return ElasticsearchDateValidatorDirective.validateControl(control);
  }
}
