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
} from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgControl,
  NgForm,
} from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CanUpdateErrorState, ErrorStateMatcher, mixinErrorState } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';
import { Field } from '../../../core/shared/model/field';
import { FocusMonitor } from '@angular/cdk/a11y';
import { isNullOrUndefined } from '../../../core/util/node-utilities';
import { StudentService } from '../../providers/student.service';

// Boilerplate for applying mixins to CourseInputComponent.
/** @docs-private */
export class CourseInputComponentBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}

export const _CourseInputComponentBase = mixinErrorState(CourseInputComponentBase);

let nextUniqueId = 0;
const YEAR_FIELD_NAME = 'yearInputForm';
const QUARTER_FIELD_NAME = 'quarterInputForm';
const COURSE_FIELD_NAME = 'courseInputForm';
const SECTION_FIELD_NAME = 'sectionInputForm';
const NUMBER_OF_FIELDS = 6; // year, quarter, curriculum, course, section, course title

/* tslint:disable:member-ordering no-host-metadata-property*/
@Component({
  selector: 'app-course-input',
  templateUrl: './course-input.component.html',
  styleUrls: ['./course-input.component.css'],
  host: {
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState',
  },
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: CourseInputComponent,
    },
    ErrorStateMatcher,
  ],
})
export class CourseInputComponent extends _CourseInputComponentBase
  implements
    ControlValueAccessor,
    MatFormFieldControl<string>,
    CanUpdateErrorState,
    AfterContentInit,
    DoCheck,
    OnDestroy {
  @Input() fieldConfig: Field;

  // properties
  formGroup: FormGroup;

  year = new Date().getFullYear().toString(); // default value
  yearControl = new FormControl();
  yearOptions: string[] = [];

  quarter = 'autumn';
  quarterControl = new FormControl();
  quarterOptions: string[] = ['autumn', 'winter', 'spring', 'summer'];

  curriculumAbbreviation =
    (this.fieldConfig && this.fieldConfig.courseConfig && this.fieldConfig.courseConfig['curriculumAbbreviation']) ||
    'PHYS';

  courseNumber = '';
  courseControl = new FormControl();
  courseOptions: any[] = [];

  section = '';
  sectionControl = new FormControl();
  sectionOptions: any[] = [];

  courseTitle = '';

  onSelectYear(event: MatSelectChange) {
    if (event.value) {
      this.year = event.value;
      this.updateCourses();
      this._propagateChanges();
    }
  }

  onSelectQuarter(event: MatSelectChange) {
    if (event.value) {
      this.quarter = event.value;
      this.updateCourses();
      this._propagateChanges();
    }
  }

  get courseAriaLabel(): string {
    return this.courseNumber && this.courseTitle ? `Course ${this.courseNumber}-${this.courseTitle}` : 'Course';
  }

  private setSectionValue(val: string) {
    if (this.section !== val) {
      this.section = val;

      if (!this.section) {
        this.sectionOptions = [];
      }
      this.sectionControl.setValue(this.section);
      this._propagateChanges();
    }
  }

  onSelectCourse(event: MatSelectChange) {
    this.courseNumber = event.value;
    for (let i = 0; i < this.courseOptions.length; i++) {
      if (this.courseOptions[i]['CourseNumber'] === this.courseNumber) {
        this.courseTitle = this.courseOptions[i]['CourseTitle'];
        break;
      }
    }
    this.updateSections();
    this._propagateChanges();
  }

  onSelectSection(event: MatSelectChange) {
    this.section = event.value;
    this._propagateChanges();
  }

  private initComponent() {
    const today = new Date();
    const years = (this.fieldConfig && this.fieldConfig.courseConfig && this.fieldConfig.courseConfig['years']) || 10;
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < years; i++) {
      this.yearOptions.push((currentYear - i).toString());
    }

    this.initInternalForm();
    this.initializeValue();
    this.setInnerInputDisableState();
  }

  private initInternalForm() {
    this.formGroup = this.fb.group({});

    this.formGroup.controls[YEAR_FIELD_NAME] = this.yearControl;
    this.formGroup.controls[QUARTER_FIELD_NAME] = this.quarterControl;
    this.formGroup.controls[COURSE_FIELD_NAME] = this.courseControl;
    this.formGroup.controls[SECTION_FIELD_NAME] = this.sectionControl;
  }

  private updateCourses() {
    if (this.year && this.quarter && this.curriculumAbbreviation) {
      const courses$ = this.studentService.getCourses(this.year, this.quarter, this.curriculumAbbreviation);
      const sections$ = this.studentService.getSections(this.year, this.quarter, this.curriculumAbbreviation);

      forkJoin(courses$, sections$).subscribe(([courses, sections]) => {
        this.courseOptions = [];

        if (courses && courses['Courses'] && sections && sections['Sections']) {
          // get course sections by course
          const secs = {};
          sections['Sections'].forEach((s) => {
            const cn = s['CourseNumber'];
            if (secs[cn]) {
              secs[cn].push(s['SectionID']);
            } else {
              secs[cn] = [s['SectionID']];
            }
          });

          // keep courses with sections (i.e. offerings)
          // and attach sections to corresponding course
          let hasSelectedCourse = false;
          courses['Courses'].forEach((c) => {
            const cn = c['CourseNumber'];
            if (secs[cn]) {
              c.sections = secs[cn];
              this.courseOptions.push(c);
              if (this.courseNumber === cn) {
                hasSelectedCourse = true;
              }
            }
          });

          // update current course selection
          if (!hasSelectedCourse && this.courseOptions.length > 0) {
            this.courseNumber = this.courseOptions[0]['CourseNumber'];
            this.courseControl.patchValue(this.courseNumber);
          } else if (this.courseOptions.length === 0) {
            this.courseNumber = '';
            this.courseTitle = '';
          }
        }

        // need to update sections when year/quarter changed, even if course remained the same
        this.updateSections();
      });
    } else {
      this.courseOptions = [];
      this.updateSections();
    }
  }

  private updateSections() {
    if (this.year && this.quarter && this.curriculumAbbreviation && this.courseNumber) {
      this.sectionOptions = [];
      // get sections from associated course. no need to call DataAPI.
      if (this.courseOptions && this.courseOptions.length > 0) {
        this.courseOptions.some((c) => {
          if (this.courseNumber === c['CourseNumber']) {
            this.sectionOptions = c.sections || [];
            return true;
          }
        });
      }

      if (!this.sectionOptions || this.sectionOptions.length === 0) {
        // disable section option
        this.setSectionValue('');
        this.sectionControl.disable();
      } else if (this.sectionOptions.length === 1) {
        if (this.section !== this.sectionOptions[0]) {
          this.setSectionValue(this.sectionOptions[0]);
        }
        this.sectionControl.disable();
      } else {
        if (!this.sectionOptions.includes(this.section)) {
          this.setSectionValue(this.sectionOptions[0]);
        }
        this.sectionControl.enable();
      }

      this.sectionControl.patchValue(this.section);
    } else {
      this.setSectionValue('');
    }
  }

  private initializeValue(): void {
    // Defer setting the value in order to avoid the "Expression
    // has changed after it was checked" errors from Angular.
    Promise.resolve().then(() => {
      if (this.ngControl || this._value) {
        if (this.ngControl) {
          this.setInternalValue(this.ngControl.value);
        } else {
          this.setInternalValue(this._value);
        }
        this.stateChanges.next();
      }
    });
  }

  private setInnerInputDisableState() {
    if (this.disabled) {
      this.yearControl.disable();
      this.quarterControl.disable();
      this.courseControl.disable();
      this.sectionControl.disable();
    } else {
      this.yearControl.enable();
      this.quarterControl.enable();
      this.courseControl.enable();
      this.sectionControl.enable();
    }
  }

  private setInternalValue(value: string) {
    let values: string[];
    if (!isNullOrUndefined(value)) {
      // parse value into year, quarter, courseNumber, section
      values = value.split('|');
    }

    if (values && values.length === NUMBER_OF_FIELDS) {
      this.year = values[0];
      this.quarter = values[1];
      this.courseNumber = values[3];
      this.courseTitle = this.courseNumber && values[4]; // Only set the course title if there is a course number.
      this.section = values[5];
    } else {
      this.courseNumber = '';
      this.courseTitle = '';
      this.setSectionValue('');
    }

    this.yearControl.patchValue(this.year);
    this.quarterControl.patchValue(this.quarter);
    this.courseControl.patchValue(this.courseNumber);
    this.sectionControl.setValue(this.section);

    this.updateCourses();
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

  protected _value: any; // year|quarter|curriculum|course|courseTitle|section

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
    const value = this.formGroup && this.formGroup.controls[COURSE_FIELD_NAME].value;
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
    private studentService: StudentService
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
    if (value) {
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
  private _propagateChanges(): void {
    if (this.courseNumber) {
      this._value =
        this.year +
        '|' +
        this.quarter +
        '|' +
        this.curriculumAbbreviation +
        '|' +
        this.courseNumber +
        '|' +
        this.courseTitle +
        '|' +
        (this.section ? this.section : '');
    } else {
      this._value = '';
    }
    this._onChange(this._value);
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
}
// End boilerplate
