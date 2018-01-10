import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self
} from '@angular/core';
import { Subject } from 'rxjs/Subject';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  CanUpdateErrorState,
  ErrorStateMatcher,
  MatFormFieldControl,
  MatSelectChange,
  mixinErrorState
} from '@angular/material';
import { isNullOrUndefined } from 'util';
import { Field } from '../../../core/shared/model/field';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { FocusMonitor } from '@angular/cdk/a11y';

// Boilerplate for applying mixins to MatChipList.
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

/* tslint:disable:member-ordering use-host-property-decorator*/
@Component({
  selector: 'app-options-input',
  templateUrl: './options-input.component.html',
  styleUrls: ['./options-input.component.css'],
  host: {
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
    '[attr.role]': 'role',
    '(focus)': 'focus()',
    '(blur)': '_blur()'
  },
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: OptionsInputComponent
    },
    ErrorStateMatcher
  ]
})
export class OptionsInputComponent extends _OptionsInputComponentBase
  implements ControlValueAccessor,
    MatFormFieldControl<string>,
    OnInit,
    CanUpdateErrorState,
    AfterContentInit,
    DoCheck,
    OnDestroy {
  // Component logic

  onSelect(event: MatSelectChange) {
    // TODO needed ?
    console.log(JSON.stringify(event.value));
  }

  @Input() fieldConfig: Field;
  options: FieldOption[] = [];
  formGroup: FormGroup;

  private initComponent() {
    this.initInternalForm();

    this.initOptions();
  }

  private initInternalForm() {
    this.formGroup = this.fb.group({});
    this.formGroup.controls[INTERNAL_FIELD_NAME] = new FormControl();
  }

  private initOptions() {
    this.options = this.fieldConfig.options.map(option => {
      return Object.assign(new FieldOption(), option);
    });
  }

  private setInnerInputDisableState() {
    if (this.formGroup && this.formGroup.controls[INTERNAL_FIELD_NAME]) {
      if (this.disabled) {
        console.log('disabling it');
        this.formGroup.controls[INTERNAL_FIELD_NAME].disable();
      } else {
        this.formGroup.controls[INTERNAL_FIELD_NAME].enable();
      }
    }
  }

  private _internalChangeSubscription;

  _listenToInternalChange() {
    this._internalChangeSubscription = this.formGroup.controls[INTERNAL_FIELD_NAME].valueChanges.subscribe(value => {
      this._propagateChanges(value);
    });
  }

  private populateInitialValue(initialValue: string) {
    if (!isNullOrUndefined(initialValue)) {
      this.formGroup.controls[INTERNAL_FIELD_NAME].patchValue(initialValue);
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
  _ariaDescribedby: string;

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
    const n = this.formGroup.value;
    return !n.optionsForm;
  }

  focused = false;

  get shouldLabelFloat(): boolean {
    return this.focused;
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
    public ngControl: NgControl
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    // This might need to be moved in ngInit or ngAfterContentInit
    this.initInternalForm();
  }

  ngAfterContentInit(): void {}

  ngOnInit() {
    this.initOptions();
    this._listenToInternalChange();
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

    this._internalChangeSubscription.unsubscribe();
    this._internalChangeSubscription = null;
  }

  // Implemented as part of MatFormFieldControl.
  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  // Implemented as part of ControlValueAccessor
  writeValue(value: any): void {
    if (value !== undefined) {
      this.populateInitialValue(value);
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

  focus() {
    // TODO
    /* if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this._elementRef.nativeElement.querySelector('select').focus();
    }*/
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
  _blur() {
    if (!this.disabled) {
      this._markAsTouched();
    }
  }

  // End boilerplate
}
