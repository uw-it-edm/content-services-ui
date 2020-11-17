import { Component, forwardRef, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormBuilder } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { FieldOptionService } from '../../providers/fieldoption.service';
import { OptionsAutocompleteComponentBaseDirective } from '../options-autocomplete/options-autocomplete-component-base.directive';

@Component({
  selector: 'app-options-multiselect',
  templateUrl: './options-multiselect.component.html',
  styleUrls: ['./options-multiselect.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionsMultiselectComponent),
      multi: true,
    },
  ],
})
export class OptionsMultiselectComponent extends OptionsAutocompleteComponentBaseDirective implements OnInit {
  selectedOptions: FieldOption[] = [];
  maxSelectionCount = Number.MAX_VALUE;

  @ViewChild('filterInputElement') filterInputElement: ElementRef<HTMLInputElement>;

  get areMoreSelectionsAllowed(): boolean {
    return this.selectedOptions.length < this.maxSelectionCount;
  }

  get multiSelectLabelText(): string {
    if (this.maxSelectionCount === Number.MAX_VALUE) {
      return this.placeholder;
    } else {
      return `${this.placeholder} (select up to ${this.maxSelectionCount})`;
    }
  }

  constructor(formBuilder: FormBuilder, fieldOptionService: FieldOptionService, liveAnnouncer: LiveAnnouncer) {
    super(formBuilder, fieldOptionService, liveAnnouncer);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const maxCountSetting = this.fieldConfig.multiSelectConfig && this.fieldConfig.multiSelectConfig.maximumSelectionCount;
    this.maxSelectionCount = typeof maxCountSetting === 'number' ? maxCountSetting : Number.MAX_VALUE;
  }

  addOptionToMultiSelect(option: FieldOption): void {
    if (this.areMoreSelectionsAllowed) {
      this.selectedOptions.push(option);
      this.refilterOptions();
      this.onChange(this.selectedOptions.map((opt) => opt.value));
      this.announceWithSelectionCount(`Selected ${option.displayValue}.`);

      this.filterInputControl.reset();
      if (this.filterInputElement) {
        this.filterInputElement.nativeElement.value = '';
      }
    }
  }

  removeOptionFromMultiSelect(option: FieldOption): void {
    const index = this.selectedOptions.findIndex((opt) => opt.value === option.value);

    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
      this.refilterOptions();

      const valueToWrite = this.selectedOptions.map((opt) => opt.value);
      this.onChange(valueToWrite.length > 0 ? valueToWrite : null);

      this.announceWithSelectionCount(`Removed ${option.displayValue}.`);
    }
  }

  announceWithSelectionCount(message: string = ''): void {
    if (this.maxSelectionCount !== Number.MAX_VALUE) {
      message += ` Selected ${this.selectedOptions.length} of ${this.maxSelectionCount} options allowed.`;
    }

    if (message) {
      this.liveAnnouncer.announce(message, 'polite');
    }
  }

  protected reset(): void {
    super.reset();
    this.selectedOptions = [];
    this.refilterOptions();
  }

  protected shouldKeepOption(option: FieldOption, filter: string | FieldOption) {
    // By default remove the options that are already in the selected options array.
    let keepOption = this.selectedOptions.findIndex((opt) => opt.value === option.value) < 0;

    if (typeof filter === 'string' && filter.length > 0) {
      // Remove options that do not match the filter string.
      keepOption = keepOption && option.displayValue.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
    }

    return keepOption;
  }

  protected loadValue(selectedValues: string[], allOptions: FieldOption[]): void {
    if (!Array.isArray(selectedValues)) {
      throw new Error(
        `OptionsMultiselectComponent expected value from model to be an array. Actual value: ${JSON.stringify(selectedValues)}`
      );
    }

    this.selectedOptions = allOptions.filter((opt) => selectedValues.includes(opt.value));
    this.refilterOptions();
  }
}
