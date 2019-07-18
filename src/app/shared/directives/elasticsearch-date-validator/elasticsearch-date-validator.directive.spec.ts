import { ElasticsearchDateValidatorDirective } from './elasticsearch-date-validator.directive';
import { FormControl, ValidationErrors } from '@angular/forms';

describe('ElasticsearchDateValidatorDirective', () => {
  const validationErrors: ValidationErrors = {
    years: {
      message: 'The year must be a valid date between 1654 and 2285'
    }
  };

  it('should create an instance', () => {
    const directive = new ElasticsearchDateValidatorDirective();
    expect(directive).toBeTruthy();
  });

  it('should return null for valid dates between 1654 & 2285', () => {
    const errorMessage = ElasticsearchDateValidatorDirective.validateTimestamp(1562085173000);
    expect(errorMessage).toBeNull();
  });

  it('validation error should be returned for timestamp that is less than 1654', () => {
    const result = ElasticsearchDateValidatorDirective.validateTimestamp(-24283006027888);
    expect(result).toEqual(validationErrors);
  });

  it('validation error should be returned for timestamp that is greater than 2285 ', () => {
    const result = ElasticsearchDateValidatorDirective.validateTimestamp(9987813173000);
    expect(result).toEqual(validationErrors);
  });

  it('validation error should be returned for control with a value that is greater than 2285 ', () => {
    const result = ElasticsearchDateValidatorDirective.validateControl(new FormControl(9987813173000));
    expect(result).toEqual(validationErrors);
  });

  it('null should be returned for control with a valid value ', () => {
    const result = ElasticsearchDateValidatorDirective.validateControl(new FormControl(1562085173000));
    expect(result).toBeNull();
  });
});
