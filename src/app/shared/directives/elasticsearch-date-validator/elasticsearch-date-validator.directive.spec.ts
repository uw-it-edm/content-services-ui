import { ElasticsearchDateValidatorDirective } from './elasticsearch-date-validator.directive';
import { ValidationErrors } from '@angular/forms';

describe('ElasticsearchDateValidatorDirective', () => {
  it('should create an instance', () => {
    const directive = new ElasticsearchDateValidatorDirective();
    expect(directive).toBeTruthy();
  });

  it('should return null for valid dates between 1653 & 2285', () => {
    const errorMessage = ElasticsearchDateValidatorDirective.validateTimestamp(1562085173000);
    expect(errorMessage).toBeNull();
  });

  it('validation error should be returned for timestamp that is less than 1653', () => {
    const errorMessage = ElasticsearchDateValidatorDirective.validateTimestamp(-24283006027888);

    const validationErrors: ValidationErrors = {
      years: {
        message: 'The year must be a valid date between 1653 and 2285'
      }
    };
    expect(errorMessage).toEqual(validationErrors);
  });

  it('validation error should be returned for timestamp that is greater than 2285 ', () => {
    const errorMessage = ElasticsearchDateValidatorDirective.validateTimestamp(9987813173000);

    const validationErrors: ValidationErrors = {
      years: {
        message: 'The year must be a valid date between 1653 and 2285'
      }
    };
    expect(errorMessage).toEqual(validationErrors);
  });
});
