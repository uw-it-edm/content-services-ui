import { Component, ElementRef, forwardRef, HostBinding, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MatCheckboxChange, MatFormFieldControl } from '@angular/material';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Field } from '../../../core/shared/model/field';

@Component({
  selector: 'app-checkbox-input',
  templateUrl: './checkbox-input.component.html',
  styleUrls: ['./checkbox-input.component.css'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: CheckboxInputComponent
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxInputComponent),
      multi: true
    }
  ]
})
export class CheckboxInputComponent implements ControlValueAccessor, MatFormFieldControl<String>, OnInit, OnDestroy {
  static nextId = 0;

  @HostBinding() id = `app-checkbox-input-${CheckboxInputComponent.nextId++}`;

  @HostBinding('attr.aria-describedby') describedBy = '';

  @Input() _value = null;

  controlType = 'app-checkbox-input';
  errorState = false;
  ngControl = null;
  focused = false;

  formGroup: FormGroup;

  stateChanges = new Subject<void>();

  private _required = false;
  private _disabled = false;
  private _placeholder: string;

  private _checkedValue = 'true';
  private _uncheckedValue: string = null;

  @Input() fieldConfig: Field;

  writeValue(value: any) {
    console.log('write :' + value);
    if (value !== undefined) {
      this._value = value;
      this.formGroup.controls['internalCheckbox'].patchValue(value === this._checkedValue ? 'checked' : null);
    }
  }

  propagateChange = (_: any) => {};

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  constructor(private fb: FormBuilder, private fm: FocusMonitor, private elRef: ElementRef, renderer: Renderer2) {
    fm.monitor(elRef.nativeElement, renderer, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      internalCheckbox: new FormControl()
    });

    if (this.fieldConfig && this.fieldConfig.checkboxOptions) {
      this._checkedValue = this.fieldConfig.checkboxOptions.checkedValue
        ? this.fieldConfig.checkboxOptions.checkedValue
        : 'true';
      this._uncheckedValue = this.fieldConfig.checkboxOptions.uncheckedValue
        ? this.fieldConfig.checkboxOptions.uncheckedValue
        : null;
    }
  }

  @HostBinding('class.floating')
  get shouldPlaceholderFloat() {
    return true;
  }

  get empty() {
    const n = this.formGroup.value;
    return !n.internalCheckbox;
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  get uncheckedValue(): string {
    return this._uncheckedValue;
  }

  get checkedValue(): string {
    return this._checkedValue;
  }

  get value(): String | null {
    return this._value;
  }

  set value(value: String | null) {
    console.log('set value :' + value);

    if (value === this._checkedValue) {
      this.formGroup.value.internalCheckbox = 'checked';
      this._value = this._checkedValue;
    } else {
      this._value = this._uncheckedValue;
    }
    this.propagateChange(this._value);
    this.stateChanges.next();
  }

  @Input()
  get required() {
    return this._required;
  }

  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get disabled() {
    return this._disabled;
  }

  set disabled(dis) {
    this._disabled = coerceBooleanProperty(dis);
    this.stateChanges.next();
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = coerceBooleanProperty(isDisabled);
    this.stateChanges.next();
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }

  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elRef.nativeElement.querySelector('input').focus();
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  refreshValue(event: MatCheckboxChange) {
    this.value = event.checked ? this._checkedValue : this._uncheckedValue;
  }
}
