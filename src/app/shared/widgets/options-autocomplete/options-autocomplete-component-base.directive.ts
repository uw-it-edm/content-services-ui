import { Input, OnDestroy, OnInit, Directive } from '@angular/core';
import { FormBuilder, AbstractControl, FormControl, FormGroup, ControlValueAccessor } from '@angular/forms';
import { Observable, Subject, concat, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil, startWith, map, skip, debounceTime, first } from 'rxjs/operators';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FieldOptionService } from '../../providers/fieldoption.service';
import { Field } from '../../../core/shared/model/field';
import { FieldOption } from '../../../core/shared/model/field/field-option';

const INTERNAL_FILTER_CONTROL_NAME = 'internalFilterControl';

/**
 * Base class for components that have an autocomplete filter.
 */
@Directive()
export class OptionsAutocompleteComponentBaseDirective implements OnInit, OnDestroy, ControlValueAccessor {
  private _disabled = false;
  private _filterInputControl: FormControl;
  private allOptions$: Observable<FieldOption[]>;
  private componentDestroyed = new Subject();
  private _refilterOptions = new Subject();
  private onTouch: () => void; // not used.
  protected onChange: (value: any) => void;

  formGroup: FormGroup;
  filteredOptions$: Observable<FieldOption[]>;

  @Input() placeholder: string;
  @Input() required = false;
  @Input() fieldConfig: Field;
  @Input() parentControl: AbstractControl;
  @Input() errorMessage: string;

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

  constructor(private formBuilder: FormBuilder, private fieldOptionService: FieldOptionService, protected liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {
    this._filterInputControl = new FormControl(null);
    this.formGroup = this.formBuilder.group({});
    this.formGroup.controls[INTERNAL_FILTER_CONTROL_NAME] = this.filterInputControl;

    this.allOptions$ = this.getAllOptions();
    const rerunFilter$ = this._refilterOptions.asObservable().pipe(startWith(null));
    const filter$: Observable<string | FieldOption> = this.filterInputControl.valueChanges.pipe(
      startWith(null),
      distinctUntilChanged(),
      takeUntil(this.componentDestroyed)
    );

    this.filteredOptions$ = combineLatest(this.allOptions$, filter$, rerunFilter$).pipe(
      map(([options, filter]) => options.filter((option) => this.shouldKeepOption(option, filter))),
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

  /**
   * This method is called by the forms API to write to the view when programmatic changes from model to view are requested.
   */
  writeValue(value: any): void {
    if (value) {
      this.allOptions$.pipe(first()).subscribe((options) => {
        this.loadValue(value, options);
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

  /**
   * Resets UI to initial values.
   */
  protected reset(): void {
    this.filterInputControl.reset();
  }

  /**
   * Re-runs the refiltering logic against all available options.
   */
  protected refilterOptions(): void {
    this._refilterOptions.next();
  }

  /**
   * Runs when filtering available options, override by sub-class to return whether to keep an option in the available list.
   */
  protected shouldKeepOption(option: FieldOption, filter: string | FieldOption) {
    return true;
  }

  /**
   * Override by sub-class to write value into view when model changes programmatically.
   */
  protected loadValue(value: any, allOptions: FieldOption[]) {}

  private setInnerInputDisableState() {
    if (this.disabled) {
      this.filterInputControl.disable();
    } else {
      this.filterInputControl.enable();
    }
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
}
