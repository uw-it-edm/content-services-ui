import { Component, forwardRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormBuilder, AbstractControl } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { FieldOptionService } from '../../providers/fieldoption.service';
import { OptionsAutocompleteComponentBase } from './options-autocomplete.component.base';

/**
 * Validator that checks if the selected value is an object (instead of a string which is the value used when filtering the list).
 */
export function RequiresFieldOptionObject(control: AbstractControl) {
  if (typeof control.value === 'string') {
    return { incorrect: true };
  }

  return null;
}

@Component({
  selector: 'app-options-autocomplete',
  templateUrl: './options-autocomplete.component.html',
  styleUrls: ['./options-autocomplete.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionsAutocompleteComponent),
      multi: true,
    },
  ],
})
export class OptionsAutocompleteComponent extends OptionsAutocompleteComponentBase implements OnInit {
  private latestValidOption: FieldOption;

  constructor(formBuilder: FormBuilder, fieldOptionService: FieldOptionService, liveAnnouncer: LiveAnnouncer) {
    super(formBuilder, fieldOptionService, liveAnnouncer);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.filterInputControl.setValidators([RequiresFieldOptionObject]);
    this.filterInputControl.updateValueAndValidity();
  }

  optionListClosed() {
    if (this.filterInputControl.invalid && this.latestValidOption) {
      // If the options list is closed and the value left in the input is invalid, reset it
      //   to the last known valid value.
      this.filterInputControl.setValue(this.latestValidOption);
    }
  }

  optionSelected(newOption: FieldOption) {
    if (newOption) {
      this.latestValidOption = newOption;
      this.onChange(newOption.value);

      this.liveAnnouncer.announce(`Selected ${newOption.displayValue}.`, 'polite');
    }
  }

  protected reset(): void {
    super.reset();
    this.latestValidOption = null;
  }

  protected shouldKeepOption(option: FieldOption, filter: string | FieldOption) {
    const fieldOption = filter as FieldOption;

    if (typeof filter === 'string' && filter.length > 0) {
      return option.displayValue.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
    } else if (fieldOption !== null && fieldOption.displayValue) {
      return option.displayValue.toLowerCase().indexOf(fieldOption.displayValue.toLowerCase()) >= 0;
    }

    return true;
  }

  protected loadValue(selectedValue: string, allOptions: FieldOption[]): void {
    if (typeof selectedValue !== 'string') {
      throw new Error(
        `OptionsAutocompleteComponent expected value from model to be a string. Actual value: ${JSON.stringify(selectedValue)}`
      );
    }

    const selectedOpt = allOptions.find((opt) => opt.value === selectedValue);
    if (selectedOpt) {
      this.latestValidOption = selectedOpt;
      this.filterInputControl.setValue(selectedOpt);
    }
  }
}
