import { Component, ElementRef, forwardRef, HostBinding, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { StudentService } from '../../providers/student.service';
import { StudentSearchResults } from '../../shared/model/student-search-results';
import { Student } from '../../shared/model/student';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatAutocompleteSelectedEvent, MatFormFieldControl } from '@angular/material';
import { FocusMonitor } from '@angular/cdk/a11y';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-student-autocomplete',
  templateUrl: './student-autocomplete.component.html',
  styleUrls: ['./student-autocomplete.component.css'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: StudentAutocompleteComponent
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StudentAutocompleteComponent),
      multi: true
    }
  ]
})
export class StudentAutocompleteComponent
  implements ControlValueAccessor, MatFormFieldControl<string>, OnInit, OnDestroy {
  static nextId = 0;

  @HostBinding() id = `app-student-autocomplete-${StudentAutocompleteComponent.nextId++}`;
  @HostBinding('attr.aria-describedby') describedBy = '';

  @Input() _value = null;

  stateChanges = new Subject<void>();

  private _required = false;
  private _disabled = false;
  private _placeholder: string;

  controlType = 'app-student-autocomplete';
  errorState = false;
  ngControl = null;
  focused = false;

  private componentDestroyed = new Subject();

  filteredOptions: Student[] = [];
  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private fm: FocusMonitor,
    private elRef: ElementRef,
    renderer: Renderer2
  ) {
    fm.monitor(elRef.nativeElement, renderer, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      studentAutocomplete: new FormControl()
    });

    this.formGroup.controls['studentAutocomplete'].valueChanges
      .startWith(null)
      .takeUntil(this.componentDestroyed)
      .subscribe((term: string) => {
        if (term && term.trim().length > 1) {
          this.studentService
            .autocomplete(term)
            .takeUntil(this.componentDestroyed)
            .subscribe((results: StudentSearchResults) => {
              this.filteredOptions = results.content;
            });
        }
      });
  }

  get displayFn() {
    return (studentNumber: string) => {
      if (this.filteredOptions && studentNumber) {
        const student: Student = this.filteredOptions.find((s: Student) => s.studentNumber === studentNumber);
        return student ? Student.convertToDisplayName(student) : null;
      }
      return null;
    };
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  writeValue(value: any): void {
    console.log('write :' + value);
    this._value = value;
    this.populateInitialValue(this.value);
  }

  private populateInitialValue(studentNumber: string) {
    if (!isNullOrUndefined(studentNumber)) {
      this.studentService
        .read(studentNumber)
        .takeUntil(this.componentDestroyed)
        .subscribe((result: Student) => {
          this.filteredOptions = [result];
          this.formGroup.controls['studentAutocomplete'].patchValue(studentNumber);
        });
    } else {
      this.formGroup.controls['studentAutocomplete'].reset();
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
    return !n.studentAutocomplete;
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elRef.nativeElement.querySelector('input').focus();
    }
  }

  onSelect(event: MatAutocompleteSelectedEvent) {
    this.value = event.option.value;
  }
}
