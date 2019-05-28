import { debounceTime, filter, first, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
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
  ViewChild
} from '@angular/core';

import { Subject } from 'rxjs';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import { StudentService } from '../../providers/student.service';
import { StudentSearchResults } from '../../shared/model/student-search-results';
import { Student } from '../../shared/model/student';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  CanUpdateErrorState,
  ErrorStateMatcher,
  MatAutocompleteTrigger,
  MatFormFieldControl,
  mixinErrorState
} from '@angular/material';
import { FocusMonitor, LiveAnnouncer } from '@angular/cdk/a11y';
import { isNullOrUndefined } from '../../../core/util/node-utilities';
import { Person } from '../../shared/model/person';

// Boilerplate for applying mixins to StudentAutocompleteComponent.
/** @docs-private */
export class StudentAutocompleteComponentBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}

export const _StudentAutocompleteComponentBase = mixinErrorState(StudentAutocompleteComponentBase);

let nextUniqueId = 0;
const INTERNAL_FIELD_NAME = 'studentAutocomplete';

// This Validator checks if the selected value is an object ( not a string as it'd be a value for the typeahead
export function RequireStudentMatch(control: AbstractControl) {
  const selection: any = control.value;
  if (!selection) {
    return null;
  }
  if (typeof selection === 'string') {
    return { incorrect: true };
  }
  return null;
}

/* tslint:disable:member-ordering use-host-property-decorator*/
@Component({
  selector: 'app-student-autocomplete',
  templateUrl: './student-autocomplete.component.html',
  styleUrls: ['./student-autocomplete.component.css'],
  host: {
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState'
  },
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: StudentAutocompleteComponent
    },
    ErrorStateMatcher
  ]
})
export class StudentAutocompleteComponent extends _StudentAutocompleteComponentBase
  implements
    ControlValueAccessor,
    MatFormFieldControl<string>,
    CanUpdateErrorState,
    AfterContentInit,
    DoCheck,
    OnDestroy {
  // Component logic
  formGroup: FormGroup;
  isLoading: boolean;

  get internalFieldName(): string {
    return INTERNAL_FIELD_NAME;
  }

  private isInternalFieldValid() {
    if (
      this.formGroup &&
      this.formGroup.controls &&
      this.formGroup.controls[INTERNAL_FIELD_NAME] &&
      this.formGroup.controls[INTERNAL_FIELD_NAME].invalid
    ) {
      return false;
    } else {
      return true;
    }
  }

  optionSelected(newStudent: Student) {
    this.announceStudentSelection(newStudent);
    this._propagateChanges(newStudent.studentNumber);
  }

  panelClosed() {
    if (!this.isInternalFieldValid()) {
      // Reset parent value with initial value
      this.setInternalValue(this._value);
    }
  }

  filteredOptions: Student[] = [];
  initialized = false;

  @ViewChild(MatAutocompleteTrigger) trigger;

  private initComponent() {
    this.initInternalForm();
    this.initInternalFormUpdateListener();
    this.initializeValue();
    this.setInnerInputDisableState();
    this.initialized = true;
  }

  private initInternalFormUpdateListener() {
    // This will listen to every INTERNAL_FIELD_NAME value changes where the content is a non empty string.
    this.formGroup.controls[INTERNAL_FIELD_NAME].valueChanges
      .pipe(
        filter(term => {
          return typeof term === 'string' && term.length > 0;
        }),
        tap(() => (this.isLoading = true)),
        debounceTime(300),
        tap(term => console.log('searching for ' + term)),
        tap(term => {
          if (term === '') {
            // user is probably trying to empty the field
            if (!this.formGroup.controls[INTERNAL_FIELD_NAME].pristine) {
              this._propagateChanges(null);
            }
          }
        }),
        switchMap(term => this.studentService.autocomplete(term)),
        takeUntil(this.componentDestroyed)
      )
      .subscribe((searchResults: StudentSearchResults) => {
        if (this.initialized) {
          this.filteredOptions = searchResults.content;
          this.announceSearchResults();
          this.isLoading = false;
        }
      });
  }

  private announceStudentSelection(student: Student) {
    const announcementMessage = 'selected ' + student.getNameAndStudentId();
    console.log('liveAnnouncer : ' + announcementMessage);

    this.liveAnnouncer.announce(announcementMessage, 'polite');
  }

  private announceSearchResults() {
    let announcementMessage;
    if (!this.filteredOptions || this.filteredOptions.length === 0) {
      announcementMessage = 'No student for search';
    } else if (this.filteredOptions.length === 1) {
      announcementMessage = 'Found 1 student : ' + this.filteredOptions[0].getNameAndStudentId();
    } else if (this.filteredOptions.length > 1) {
      announcementMessage = 'Found ' + this.filteredOptions.length + ' students';
    }

    console.log('liveAnnouncer : ' + announcementMessage);

    this.liveAnnouncer.announce(announcementMessage, 'polite');
  }

  private initInternalForm() {
    this.formGroup = this.fb.group({});
    this.formGroup.controls[INTERNAL_FIELD_NAME] = new FormControl('', [RequireStudentMatch]);
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

  private setInternalValue(studentNumber: string) {
    if (!isNullOrUndefined(studentNumber)) {
      if (this.formGroup && this.formGroup.controls[INTERNAL_FIELD_NAME]) {
        this.studentService
          .read(studentNumber)
          .pipe(first())
          .subscribe((result: Student) => {
            this.filteredOptions = [result];
            this.formGroup.controls[INTERNAL_FIELD_NAME].patchValue(result);
          });
      }
    } else {
      this.formGroup.controls[INTERNAL_FIELD_NAME].reset();
    }
  }

  displayFn(student?: Student) {
    return student && student instanceof Student ? student.getNameAndStudentId() : undefined;
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

  @HostBinding('attr.role')
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
  get shouldPlaceholderFloat() {
    return this.focused || !this.empty;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
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
    private liveAnnouncer: LiveAnnouncer,
    private studentService: StudentService,
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

  validate() {
    // check if the existing value is valid
    const studentNumber =
      this.formGroup &&
      this.formGroup.controls[INTERNAL_FIELD_NAME] &&
      this.formGroup.controls[INTERNAL_FIELD_NAME].value;
    let student: Student = null;
    if (this.filteredOptions && !isNullOrUndefined(studentNumber)) {
      student = this.filteredOptions.find((s: Student) => s.studentNumber === studentNumber);
    }

    // clear the value if the value is invalid
    if (!student) {
      this.setInternalValue(null);
      this._propagateChanges(null);
    }
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
