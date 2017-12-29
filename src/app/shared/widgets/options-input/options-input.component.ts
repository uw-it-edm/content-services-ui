import { Component, ElementRef, forwardRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatFormFieldControl, MatSelectChange } from '@angular/material';
import { FocusMonitor } from '@angular/cdk/a11y';
import { isNullOrUndefined } from 'util';
import { Field } from '../../../core/shared/model/field';
import { FieldOption } from '../../../core/shared/model/field/field-option';

@Component({
  selector: 'app-options-input',
  templateUrl: './options-input.component.html',
  styleUrls: ['./options-input.component.css'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: OptionsInputComponent
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OptionsInputComponent),
      multi: true
    }
  ]
})
export class OptionsInputComponent implements ControlValueAccessor, MatFormFieldControl<string>, OnInit, OnDestroy {
  static nextId = 0;

  @HostBinding() id = `app-options-input-${OptionsInputComponent.nextId++}`;
  @HostBinding('attr.aria-describedby') describedBy = '';

  @Input() _value = null;
  @Input() fieldConfig: Field;

  stateChanges = new Subject<void>();

  private _required = false;
  private _disabled = false;
  private _placeholder: string;

  controlType = 'app-options-input';
  errorState = false;
  ngControl = null;
  focused = false;

  private componentDestroyed = new Subject();

  options: FieldOption[] = [];
  formGroup: FormGroup;

  constructor(private fb: FormBuilder, private fm: FocusMonitor, private elRef: ElementRef) {
    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      optionsForm: new FormControl()
    });

    this.options = this.fieldConfig.options.map(option => {
      return Object.assign(new FieldOption(), option);
    });
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  writeValue(value: any): void {
    console.log('write :' + value);
    if (value !== undefined) {
      this._value = value;
      this.populateInitialValue(this.value);
    }
  }

  private populateInitialValue(initialValue: string) {
    if (!isNullOrUndefined(initialValue)) {
      this.formGroup.controls['optionsForm'].patchValue(initialValue);
    }
  }

  propagateChange = (_: any) => {};

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  setDisabledState(isDisabled: boolean): void {
    this._disabled = coerceBooleanProperty(isDisabled);
    this.stateChanges.next();
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
    this.propagateChange(this._value);
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

  @HostBinding('class.floating')
  get shouldPlaceholderFloat() {
    return this.focused || !this.empty;
  }

  get empty() {
    const n = this.formGroup.value;
    return !n.optionsForm;
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    /*   if ((event.target as Element).tagName.toLowerCase() !== 'input') {
         this.elRef.nativeElement.querySelector('input').focus();
       }*/
  }

  onSelect(event: MatSelectChange) {
    console.log(JSON.stringify(event.value));
    this.value = event.value;
  }
}
