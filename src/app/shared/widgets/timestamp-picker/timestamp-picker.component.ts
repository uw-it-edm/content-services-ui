import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import * as moment from 'moment-timezone';
import { isNullOrUndefined } from '../../../core/util/node-utilities';

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

  private userTimeZone = moment.tz.guess();

  formGroup: FormGroup;
  onTouched = () => {};

  constructor(private fb: FormBuilder) {}

  private getUserOffsetAtDate(date: Date): number {
    return moment.tz(moment(date), this.userTimeZone).utcOffset();
  }

  private getSeattleOffset(date: Date): number {
    return moment.tz(moment(date), 'America/Los_Angeles').utcOffset();
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      internalDate: new FormControl()
    });

    this.formGroup.controls['internalDate'].valueChanges
      .startWith(null)
      .takeUntil(this.componentDestroyed)
      .subscribe((date: Date) => {
        if (date) {
          // offset need to be calculated for the specified date date
          const shift = this.getSeattleOffset(date) - this.getUserOffsetAtDate(date);

          const adjustedDate = moment(date)
            .tz(this.userTimeZone)
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
      const date = moment(value);

      const shift = this.getSeattleOffset(date) - this.getUserOffsetAtDate(date);

      const shiftedDate = date.add(shift, 'minutes').toDate();
      this.formGroup.controls['internalDate'].patchValue(shiftedDate);
    } else if (isNullOrUndefined(value)) {
      this.formGroup.controls['internalDate'].reset();
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
