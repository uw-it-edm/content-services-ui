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
  Self
} from '@angular/core';
import {
  CanUpdateErrorState,
  ErrorStateMatcher,
  MatCheckboxChange,
  MatFormFieldControl,
  mixinErrorState
} from '@angular/material';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Field } from '../../../core/shared/model/field';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { isNullOrUndefined } from '../../../core/util/node-utilities';

// Boilerplate for applying mixins to CheckboxInputComponent.
/** @docs-private */
export class CheckboxInputComponentBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}

export const _CheckboxInputComponentBase = mixinErrorState(CheckboxInputComponentBase);

let nextUniqueId = 0;
const INTERNAL_FIELD_NAME = 'internalCheckbox';

/* tslint:disable:member-ordering use-host-property-decorator*/
@Component({
  selector: 'app-checkbox-input',
  templateUrl: './checkbox-input.component.html',
  styleUrls: ['./checkbox-input.component.css'],
  host: {
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState'
  },
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: CheckboxInputComponent
    },
    ErrorStateMatcher
  ]
})
export class CheckboxInputComponent extends _CheckboxInputComponentBase
  implements
    ControlValueAccessor,
    MatFormFieldControl<String>,
    CanUpdateErrorState,
    AfterContentInit,
    DoCheck,
    OnDestroy {
  // Component logic
  private _checkedValue = 'true';
  private _uncheckedValue: string = null;

  @Input() fieldConfig: Field;
  options: FieldOption[] = [];
  formGroup: FormGroup;

  get internalFieldName(): string {
    return INTERNAL_FIELD_NAME;
  }

  private initComponent() {
    this.initOptions();
    this.initInternalForm();
    this.initializeValue();
    this.setInnerInputDisableState();
  }

  private initInternalForm() {
    this.formGroup = this.fb.group({});
    this.formGroup.controls[INTERNAL_FIELD_NAME] = new FormControl();
  }

  private updateInternalValue(externalValue: string) {
    if (this.formGroup && this.formGroup.controls[INTERNAL_FIELD_NAME]) {
      this.formGroup.controls[INTERNAL_FIELD_NAME].patchValue(externalValue === this._checkedValue ? 'checked' : null);
    }
  }

  private initOptions() {
    if (this.fieldConfig && this.fieldConfig.checkboxOptions) {
      console.log(JSON.stringify(this.fieldConfig));
      this._checkedValue = this.fieldConfig.checkboxOptions.checkedValue
        ? this.fieldConfig.checkboxOptions.checkedValue
        : 'true';
      this._uncheckedValue = this.fieldConfig.checkboxOptions.uncheckedValue
        ? this.fieldConfig.checkboxOptions.uncheckedValue
        : null;
    }
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

  internalCheckboxUpdated(event: MatCheckboxChange) {
    console.log('checked  value : ' + this._checkedValue);
    const value = event.checked ? this._checkedValue : this._uncheckedValue;
    this._propagateChanges(value);
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

  private setInternalValue(value: string) {
    console.log('value : ' + value);
    if (!isNullOrUndefined(value)) {
      this.updateInternalValue(value);
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
  @HostBinding('attr.aria-describedby') _ariaDescribedby: string = null;

  @HostBinding('attr.aria-role')
  get role(): string | null {
    return this.empty ? null : 'checkbox';
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

  /** Required for FormFieldControl. Whether the Input is required. */
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
  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return true;
  }

  /** Whether this input is disabled. */
  get disabled() {
    return this.ngControl ? this.ngControl.disabled : this._disabled;
  }

  @Input()
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
    public ngControl: NgControl
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterContentInit(): void {
    this.initComponent();
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
    this.focus();
    this._markAsTouched();
  }

  @HostListener('focus')
  focus() {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this._elementRef.nativeElement.querySelector('input').focus();
    }
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

  /** When blurred, mark the field as touched when focus moved outside the chip list. */
  @HostListener('blur')
  blur() {
    if (!this.disabled) {
      this._markAsTouched();
    }
  }

  // End boilerplate
}
