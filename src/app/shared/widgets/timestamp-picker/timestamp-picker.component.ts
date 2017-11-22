import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-timestamp-picker',
  templateUrl: './timestamp-picker.component.html',
  styleUrls: ['./timestamp-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimestampPickerComponent),
      multi: true
    }
  ]
})
export class TimestampPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private _required = false;
  private _disabled = false;
  private _placeholder: string;

  private componentDestroyed = new Subject();

  private userOffset = moment().utcOffset();

  private seattleOffset;

  formGroup: FormGroup;
  onTouched = () => {};

  constructor(private fb: FormBuilder) {}

  private getSeattleOffset(): number {
    return moment()
      .tz('America/Los_Angeles')
      .utcOffset();
  }

  ngOnInit() {
    this.seattleOffset = this.getSeattleOffset();

    this.formGroup = this.fb.group({
      internalDate: new FormControl()
    });

    this.formGroup.controls['internalDate'].valueChanges
      .startWith(null)
      .takeUntil(this.componentDestroyed)
      .subscribe((date: Date) => {
        if (date) {
          const shift = this.seattleOffset - this.userOffset;
          const adjustedDate = moment(date)
            .subtract(shift, 'minutes')
            .valueOf();
          this.propagateChange(adjustedDate);
        }
      });
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  writeValue(value: any): void {
    if (value !== undefined && parseInt(value, 10) > 0) {
      const shift = this.seattleOffset - this.userOffset;
      const date = moment(value)
        .utcOffset(this.getSeattleOffset())
        .add(shift, 'minutes')
        .toDate();
      this.formGroup.controls['internalDate'].patchValue(date);
    }
  }

  propagateChange = (_: any) => {};

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }

  set placeholder(plh) {
    this._placeholder = plh;
  }

  @Input()
  get required() {
    return this._required;
  }

  set required(req) {
    this._required = coerceBooleanProperty(req);
  }

  @Input()
  get disabled() {
    return this._disabled;
  }

  set disabled(dis) {
    this._disabled = coerceBooleanProperty(dis);
  }
}
