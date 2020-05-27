import { Component, forwardRef, Input, OnInit, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormGroup,
  FormBuilder,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Subject, Observable, of, combineLatest, concat } from 'rxjs';
import { takeUntil, map, switchMap, startWith, first } from 'rxjs/operators';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { Field } from '../../../core/shared/model/field';
import { FieldOptionService } from '../../providers/fieldoption.service';

const INTERNAL_FIELD_NAME = 'internalAutocomplete';

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
  private componentDestroyed = new Subject();
  private latestValidOption: FieldOption;
  private onChange: (value: string) => void;
  private onTouch: () => void; // not used.

  @Input() required = false;
  @Input() placeholder: string;
  @Input() fieldConfig: Field;
  @Input() parentControl: AbstractControl;
  @Input() errorMessage: string;
  formGroup: FormGroup;
  filteredOptions$: Observable<FieldOption[]>;

  @Input()
  get disabled() {
    return this._disabled;
  }

  set disabled(val: boolean) {
    this._disabled = !!val;
    this.setInnerInputDisableState();
  }

  get internalFieldName(): string {
    return INTERNAL_FIELD_NAME;
  }

  constructor(
    private fb: FormBuilder,
    private fieldOptionService: FieldOptionService,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  ngOnInit(): void {
    const allOptions$ = this.getAllOptions();
    const autocompleteControl = new FormControl('', [RequiresFieldOptionObject]);
    const filter$: Observable<string | FieldOption> = autocompleteControl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.componentDestroyed));

    this.formGroup = this.fb.group({});
    this.formGroup.controls[INTERNAL_FIELD_NAME] = autocompleteControl;

    this.filteredOptions$ = combineLatest(allOptions$, filter$).pipe(
      map(([options, filter]) =>
        options.filter((option) => {
          if (typeof filter === 'string' && filter.length > 0) {
            return !filter || option.displayValue.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
          }
          return true;
        })
      )
    );
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  getOptionDisplayValue(option?: FieldOption) {
    return option && option.displayValue;
  }

  optionListClosed() {
    if (!this.isInternalFieldValid() && this.latestValidOption) {
      // If the options list is closed and the value left in the input is invalid, reset it
      //   to the last known valid value.
      this.formGroup.controls[INTERNAL_FIELD_NAME].patchValue(this.latestValidOption);
    }
  }

  optionSelected(newOption: FieldOption) {
    if (newOption) {
      this.liveAnnouncer.announce(`Selected ${newOption.displayValue}`, 'polite');
      this.latestValidOption = newOption;
      this.onChange(newOption.value);
    } else {
      this.onChange(null);
    }
  }

  writeValue(value: any): void {
    if (value) {
      this.filteredOptions$.pipe(first()).subscribe((options) => {
        const selectedOpt = options.find((opt) => opt.value === value);
        if (selectedOpt) {
          this.latestValidOption = selectedOpt;
          this.formGroup.controls[INTERNAL_FIELD_NAME].patchValue(selectedOpt);
        }
      });
    } else {
      this.latestValidOption = null;
      this.formGroup.controls[INTERNAL_FIELD_NAME].reset();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private getAllOptions(): Observable<FieldOption[]> {
    const dynamicSelectConfig = this.fieldConfig.dynamicSelectConfig;
    const parentFieldConfig = dynamicSelectConfig && dynamicSelectConfig.parentFieldConfig;

    let allOptions = this.fieldOptionService.getFieldOptions(this.fieldConfig, this.parentControl && this.parentControl.value);

    if (parentFieldConfig) {
      allOptions = concat(allOptions, this.parentControl.valueChanges.pipe(
        switchMap((newParentValue) => {
          if (newParentValue) {
            return this.fieldOptionService.getOptionsFromParent(dynamicSelectConfig, parentFieldConfig, newParentValue);
          } else {
            return of([]);
          }
        }),
        takeUntil(this.componentDestroyed)
      ));
    }

    return allOptions;
  }

  private isInternalFieldValid() {
    if (
      this.formGroup &&
      this.formGroup.controls &&
      this.formGroup.controls[INTERNAL_FIELD_NAME] &&
      this.formGroup.controls[INTERNAL_FIELD_NAME].invalid
    ) {
      return false;
    }

    return true;
  }

  private setInnerInputDisableState() {
    if (this.formGroup && this.formGroup.controls[INTERNAL_FIELD_NAME]) {
      if (this.disabled) {
        this.formGroup.controls[INTERNAL_FIELD_NAME].disable();
      } else {
        this.formGroup.controls[INTERNAL_FIELD_NAME].enable();
      }
    }
  }
}
