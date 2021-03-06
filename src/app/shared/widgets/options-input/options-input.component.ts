import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import { Observable, of, Subject, concat } from 'rxjs';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgControl,
  NgForm,
} from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CanUpdateErrorState, ErrorStateMatcher, mixinErrorState, MatOption } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSelectChange, MatSelect } from '@angular/material/select';
import { Field } from '../../../core/shared/model/field';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { FocusMonitor } from '@angular/cdk/a11y';
import { isNullOrUndefined } from '../../../core/util/node-utilities';
import { takeUntil, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { FieldOptionService } from '../../providers/fieldoption.service';

// Boilerplate for applying mixins to OptionsInputComponent.
/** @docs-private */
export class OptionsInputComponentBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}

export const _OptionsInputComponentBase = mixinErrorState(OptionsInputComponentBase);

let nextUniqueId = 0;
const INTERNAL_FIELD_NAME = 'optionsForm';

/* tslint:disable:member-ordering no-host-metadata-property*/
@Component({
  selector: 'app-options-input',
  templateUrl: './options-input.component.html',
  styleUrls: ['./options-input.component.css'],
  host: {
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
  },
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: OptionsInputComponent,
    },
    ErrorStateMatcher,
  ],
})
export class OptionsInputComponent extends _OptionsInputComponentBase
  implements
    ControlValueAccessor,
    MatFormFieldControl<string>,
    CanUpdateErrorState,
    AfterContentInit,
    DoCheck,
    OnDestroy {
  // Component logic

  onSelect(event: MatSelectChange) {
    this._propagateChanges(event.value);
  }

  get internalFieldName(): string {
    return INTERNAL_FIELD_NAME;
  }

  @ViewChild('selectDropDown', { static: true }) matSelect: MatSelect;
  @Input() fieldConfig: Field;
  @Input() parentControl: AbstractControl;
  options$: Observable<FieldOption[]>;
  formGroup: FormGroup;

  get selectedOptionText(): string {
    let optionText: string;

    try {
      const matOption = this.matSelect && (this.matSelect.selected as MatOption);
      optionText = matOption && matOption.viewValue;
    } catch {
      // MatSelect throws exception instead of returning null or empty array if nothing is selected.
    }

    return this.placeholder + (optionText ? ` ${optionText}` : '');
  }

  private initComponent() {
    this.initInternalForm();
    this.initOptions();
    this.initializeValue();
    this.setInnerInputDisableState();
  }

  private initInternalForm() {
    this.formGroup = this.fb.group({});
    this.formGroup.controls[INTERNAL_FIELD_NAME] = new FormControl();
  }

  private initOptions() {
    const dynamicSelectConfig = this.fieldConfig.dynamicSelectConfig;
    const parentFieldConfig = dynamicSelectConfig && dynamicSelectConfig.parentFieldConfig;

    let allOptions = this.fieldOptionService.getFieldOptions(this.fieldConfig, this.parentControl && this.parentControl.value);

    if (parentFieldConfig) {
      allOptions = concat(allOptions, this.parentControl.valueChanges.pipe(
        distinctUntilChanged(),
        switchMap((newParentValue) => {
          this._propagateChanges(null);
          if (newParentValue) {
            return this.fieldOptionService.getOptionsFromParent(dynamicSelectConfig, parentFieldConfig, newParentValue);
          } else {
            return of([]);
          }
        }),
        takeUntil(this.componentDestroyed)
      ));
    }

    this.options$ = allOptions;
  }

  private initializeValue(): void {
    // Defer setting the value in order to avoid the "Expression
    // has changed after it was checked" errors from Angular.
    Promise.resolve().then(() => {
      if (this.ngControl || this._value) {
        this.setInternalValue(this.ngControl ? this.ngControl.value : this._value);
        this.stateChanges.next();
      }
    });
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

  private setInternalValue(value: string) {
    if (!isNullOrUndefined(value)) {
      if (this.formGroup && this.formGroup.controls[INTERNAL_FIELD_NAME]) {
        this.formGroup.controls[INTERNAL_FIELD_NAME].patchValue(value);
      }
    } else {
      this.formGroup.controls[INTERNAL_FIELD_NAME].reset();
    }
  }

  // End Component logic

  // MatFormField boilerplate

  /** Function when touched */
  _onTouched = () => {};

  /** Function when changed */
  _onChange: (value: any) => void = () => {};

  /** Uid of the chip list */
  protected _uid = `custom-input-${nextUniqueId++}`;
  protected _id: string;

  /** Whether this is required */
  protected _required = false;

  /** Whether this is disabled */
  protected _disabled = false;

  protected _value: any;

  /** Placeholder for the chip list. Alternatively, placeholder can be set on MatChipInput */
  protected _placeholder: string;

  /** The aria-describedby attribute on the chip list for improved a11y. */
  @HostBinding('attr.aria-describedby') _ariaDescribedby: string;

  @HostBinding('attr.role')
  /** https://www.w3.org/TR/wai-aria/roles#listbox */
  get role(): string | null {
    return this.empty ? null : 'listbox';
  }

  /** An object used to control when error messages are shown. */
  @Input() errorStateMatcher: ErrorStateMatcher;

  /** Required for FormFieldControl */
  @Input()
  get value() {
    return this._value;
  }

  set value(newValue: any) {
    this.writeValue(newValue);
    this._value = newValue;
  }

  /** Required for FormFieldControl. The ID of the chip list */
  @Input()
  set id(value: string) {
    this._id = value;
    this.stateChanges.next();
  }

  get id() {
    return this._id || this._uid;
  }

  /** Required for FormFieldControl. Whether the chip list is required. */
  @Input()
  set required(value: any) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  get required() {
    return this._required;
  }

  /** For FormFieldControl. Use chip input's placholder if there's a chip input */
  @Input()
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  get placeholder() {
    return this._placeholder;
  }

  get empty() {
    const value = this.formGroup.controls[INTERNAL_FIELD_NAME].value;
    return !value;
  }

  focused = false;

  @HostListener('focusin')
  onFocusin() {
    this.focused = true;
  }

  @HostListener('focusout')
  onFocusout() {
    this.focused = false;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  /** Whether this input is disabled. */
  @Input()
  get disabled() {
    return this.ngControl ? this.ngControl.disabled : this._disabled;
  }

  set disabled(value: any) {
    // this need to be implemented if you want to disable the internal input

    this._disabled = coerceBooleanProperty(value);
    this.setInnerInputDisableState();
  }

  constructor(
    private fb: FormBuilder,
    private fm: FocusMonitor,
    protected _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional()
    @Self()
    public ngControl: NgControl,
    private fieldOptionService: FieldOptionService
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterContentInit(): void {
    this.initComponent();
    this.stateChanges.next();
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }

  private componentDestroyed = new Subject();

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
    this.stateChanges.complete();
    this.fm.stopMonitoring(this._elementRef.nativeElement);

    /*    this._internalChangeSubscription.unsubscribe();
    this._internalChangeSubscription = null;*/
  }

  // Implemented as part of MatFormFieldControl.
  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  // Implemented as part of ControlValueAccessor
  writeValue(value: any): void {
    if (value !== undefined) {
      this.setInternalValue(value);
    }
  }

  // Implemented as part of ControlValueAccessor
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  // Implemented as part of ControlValueAccessor
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;

    // not sure this one is needed as the inner input should rely on the disabled state of the model
    this._elementRef.nativeElement.disabled = disabled;
    this.stateChanges.next();
  }

  onContainerClick() {
    this._markAsTouched();
  }

  /** Emits change event to set the model value. */
  private _propagateChanges(valueToEmit: any): void {
    this._value = valueToEmit;
    this._onChange(valueToEmit);
    this._changeDetectorRef.markForCheck();
  }

  /** Mark the field as touched */
  _markAsTouched() {
    this._onTouched();
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  /** When blurred, mark the field as touched when focus moved outside the Input. */
  @HostListener('blur')
  blur() {
    if (!this.disabled) {
      this._markAsTouched();
    }
  }

  // End boilerplate
}
