import { Component, forwardRef, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Subject, Observable, of, combineLatest, concat } from 'rxjs';
import { takeUntil, map, switchMap, startWith, first, distinctUntilChanged, debounceTime, skip } from 'rxjs/operators';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { Field } from '../../../core/shared/model/field';
import { FieldOptionService } from '../../providers/fieldoption.service';
import { NullTemplateVisitor } from '@angular/compiler';

const INTERNAL_FILTER_CONTROL_NAME = 'internalFilterControl';

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
export class OptionsAutocompleteComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private _disabled = false;
  private _filterInputControl: FormControl;
  private selectedOptionsChanged = new Subject();
  private allOptions$: Observable<FieldOption[]>;
  private componentDestroyed = new Subject();
  private latestValidOption: FieldOption;
  private onChange: (value: string | string[]) => void;
  private onTouch: () => void; // not used.

  @Input() multiSelect = false;
  @Input() required = false;
  @Input() placeholder: string;
  @Input() fieldConfig: Field;
  @Input() parentControl: AbstractControl;
  @Input() errorMessage: string;

  @ViewChild('filterInputElement') filterInputElement: ElementRef<HTMLInputElement>;

  formGroup: FormGroup;
  filteredOptions$: Observable<FieldOption[]>;
  selectedOptions: FieldOption[] = [];
  maxSelectionCount = Number.MAX_VALUE;

  @Input()
  get disabled() {
    return this._disabled;
  }

  set disabled(val: boolean) {
    this._disabled = !!val;
    this.setInnerInputDisableState();
  }

  get filterInputControl(): FormControl {
    return this._filterInputControl;
  }

  get areMoreSelectionsAllowed(): boolean {
    return this.selectedOptions.length < this.maxSelectionCount;
  }

  get multiSelectLabelText(): string {
    if (!this.multiSelect || this.maxSelectionCount === Number.MAX_VALUE) {
      return this.placeholder;
    } else {
      return `${this.placeholder} (select up to ${this.maxSelectionCount})`;
    }
  }

  constructor(private fb: FormBuilder, private fieldOptionService: FieldOptionService, private liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {
    const maxCountSetting = this.fieldConfig.filterSelectConfig && this.fieldConfig.filterSelectConfig.maximumSelectionCount;
    this.maxSelectionCount = typeof maxCountSetting === 'number' ? maxCountSetting : Number.MAX_VALUE;

    this._filterInputControl = new FormControl(null, this.multiSelect ? [] : [RequiresFieldOptionObject]);
    this.formGroup = this.fb.group({});
    this.formGroup.controls[INTERNAL_FILTER_CONTROL_NAME] = this.filterInputControl;

    this.allOptions$ = this.getAllOptions();
    const forceFilter$ = this.selectedOptionsChanged.asObservable().pipe(startWith(null));
    const filter$: Observable<string | FieldOption> = this.filterInputControl.valueChanges.pipe(
      startWith(null),
      distinctUntilChanged(),
      takeUntil(this.componentDestroyed)
    );

    this.filteredOptions$ = combineLatest(this.allOptions$, filter$, forceFilter$).pipe(
      map(([options, filter]) =>
        options.filter((option) => {
          const fieldOption = filter as FieldOption;

          // By default remove the options that are already in the selected options array.
          let keepOption = this.selectedOptions.findIndex((opt) => opt.value === option.value) < 0;

          if (typeof filter === 'string' && filter.length > 0) {
            // Remove options that do not match the filter string.
            keepOption = keepOption && option.displayValue.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
          } else if (!this.multiSelect && fieldOption !== null && fieldOption.displayValue) {
            keepOption = option.displayValue.toLowerCase().indexOf(fieldOption.displayValue.toLowerCase()) >= 0;
          }

          return keepOption;
        })
      ),
      takeUntil(this.componentDestroyed)
    );

    // Setup separate observable chain to update the live announcer.
    this.filteredOptions$
      .pipe(
        skip(1), // Skip the initial set of options.
        debounceTime(500),
        takeUntil(this.componentDestroyed)
      )
      .subscribe((options) => this.announceFilteredOptions(options));
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  getOptionDisplayValue(option?: FieldOption) {
    return option && option.displayValue;
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
      if (this.multiSelect) {
        this.addOptionToMultiSelect(newOption);
      } else {
        this.latestValidOption = newOption;
        this.onChange(newOption.value);
      }

      this.announceWithSelectionCount(`Selected ${newOption.displayValue}.`);
    }
  }

  removeOptionFromMultiSelect(option: FieldOption): void {
    const index = this.selectedOptions.findIndex((opt) => opt.value === option.value);

    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
      this.selectedOptionsChanged.next();
      this.onChange(this.selectedOptions.map((opt) => opt.value));
      this.announceWithSelectionCount(`Removed ${option.displayValue}.`);
    }
  }

  announceWithSelectionCount(message: string = ''): void {
    if (this.multiSelect && this.maxSelectionCount !== Number.MAX_VALUE) {
      message += ` Selected ${this.selectedOptions.length} of ${this.maxSelectionCount} options allowed.`;
    }

    if (message) {
      this.liveAnnouncer.announce(message, 'polite');
    }
  }

  /**
   * This method is called by the forms API to write to the view when programmatic changes from model to view are requested.
   */
  writeValue(value: any): void {
    if (value) {
      this.allOptions$.pipe(first()).subscribe((options) => {
        this.multiSelect ? this.loadMultipleValues(value, options) : this.loadSingleValue(value, options);
      });
    } else {
      this.reset();
    }
  }

  /**
   * When the value changes in the UI, the registered function should be called to allow the forms API to update itself.
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private reset(): void {
    this.latestValidOption = null;
    this.filterInputControl.reset();
    this.selectedOptions = [];
    this.selectedOptionsChanged.next();
  }

  private addOptionToMultiSelect(option: FieldOption): void {
    if (this.areMoreSelectionsAllowed) {
      this.selectedOptions.push(option);
      this.selectedOptionsChanged.next();
      this.onChange(this.selectedOptions.map((opt) => opt.value));

      this.filterInputControl.reset();
      if (this.filterInputElement) {
        this.filterInputElement.nativeElement.value = '';
      }
    }
  }

  private loadSingleValue(selectedValue: string, allOptions: FieldOption[]): void {
    if (typeof selectedValue !== 'string') {
      throw new Error(
        `OptionsAutocompleteComponent with multiSelect=false expected value from model to be a string. Actual value: ${JSON.stringify(
          selectedValue
        )}`
      );
    }

    const selectedOpt = allOptions.find((opt) => opt.value === selectedValue);
    if (selectedOpt) {
      this.latestValidOption = selectedOpt;
      this.filterInputControl.setValue(selectedOpt);
    }
  }

  private loadMultipleValues(selectedValues: string[], allOptions: FieldOption[]): void {
    if (!Array.isArray(selectedValues)) {
      throw new Error(
        `OptionsAutocompleteComponent with multiSelect=true expected value from model to be an array. Actual value: ${JSON.stringify(
          selectedValues
        )}`
      );
    }

    this.selectedOptions = allOptions.filter((opt) => selectedValues.includes(opt.value));
    this.selectedOptionsChanged.next();
  }

  private getAllOptions(): Observable<FieldOption[]> {
    const dynamicSelectConfig = this.fieldConfig.dynamicSelectConfig;
    const parentFieldConfig = dynamicSelectConfig && dynamicSelectConfig.parentFieldConfig;
    const parentControlValue = this.parentControl && this.parentControl.value;

    let allOptions = this.fieldOptionService.getFieldOptions(this.fieldConfig, parentControlValue);

    if (parentFieldConfig) {
      allOptions = concat(
        allOptions,
        this.parentControl.valueChanges.pipe(
          distinctUntilChanged(),
          switchMap((newParentValue) => {
            this.reset();
            this.onChange(null);

            if (newParentValue) {
              return this.fieldOptionService.getOptionsFromParent(dynamicSelectConfig, parentFieldConfig, newParentValue);
            } else {
              return of([]);
            }
          }),
          takeUntil(this.componentDestroyed)
        )
      );
    }

    return allOptions;
  }

  private announceFilteredOptions(options: FieldOption[]) {
    let message: string;

    if (typeof this.filterInputControl.value !== 'string') {
      // Do not announce if input control is not being used as a filter.
      return;
    }

    if (!options || options.length === 0) {
      message = 'Found no results.';
    } else if (options.length === 1) {
      message = `Found one result: ${options[0].displayValue}.`;
    } else {
      message = `Found ${options.length} results.`;
    }

    this.liveAnnouncer.announce(message, 'polite');
  }

  private setInnerInputDisableState() {
    if (this.disabled) {
      this.filterInputControl.disable();
    } else {
      this.filterInputControl.enable();
    }
  }
}
