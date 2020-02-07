import { debounceTime, filter, first, switchMap, takeUntil, tap } from 'rxjs/operators';
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
import { PersonSearchResults } from '../../shared/model/person-search-results';
import { Person } from '../../shared/model/person';
import { PersonService } from '../../providers/person.service';

// Boilerplate for applying mixins to PersonAutocompleteComponent.
/** @docs-private */
export class PersonAutocompleteComponentBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}

export const _PersonAutocompleteComponentBase = mixinErrorState(PersonAutocompleteComponentBase);

let nextUniqueId = 0;
const INTERNAL_FIELD_NAME = 'personAutocomplete';

// This Validator checks if the selected value is an object ( not a string as it'd be a value for the typeahead
export function RequirePersonMatch(control: AbstractControl) {
  const selection: any = control.value;
  if (!selection) {
    return null;
  }
  if (typeof selection === 'string') {
    return { incorrect: true };
  }
  return null;
}

/* tslint:disable:member-ordering no-host-metadata-property*/
@Component({
  selector: 'app-person-autocomplete',
  templateUrl: './person-autocomplete.component.html',
  styleUrls: ['./person-autocomplete.component.css'],
  host: {
    '[attr.aria-required]': 'required.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.aria-invalid]': 'errorState'
  },
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: PersonAutocompleteComponent
    },
    ErrorStateMatcher
  ]
})
export class PersonAutocompleteComponent extends _PersonAutocompleteComponentBase
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

  optionSelected(newPerson: Person) {
    this.announcePersonSelection(newPerson);
    this._propagateChanges(newPerson.regId);
  }

  panelClosed() {
    if (!this.isInternalFieldValid()) {
      // Reset parent value with initial value
      this.setInternalValue(this._value);
    }
  }

  filteredOptions: Person[] = [];
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
          return typeof term === 'string';
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
        switchMap(term => this.personService.autocomplete(term)),
        takeUntil(this.componentDestroyed)
      )
      .subscribe((searchResults: PersonSearchResults) => {
        if (this.initialized) {
          this.filteredOptions = searchResults.content;
          this.announceSearchResults();
          this.isLoading = false;
        }
      });
  }

  private announcePersonSelection(person: Person) {
    const announcementMessage = 'selected ' + person.getNameAndEmployeeId();
    console.log('liveAnnouncer : ' + announcementMessage);

    this.liveAnnouncer.announce(announcementMessage, 'polite');
  }

  private announceSearchResults() {
    let announcementMessage;
    if (!this.filteredOptions || this.filteredOptions.length === 0) {
      announcementMessage = 'No results';
    } else if (this.filteredOptions.length === 1) {
      announcementMessage = 'Found 1 person : ' + this.filteredOptions[0].getNameAndEmployeeId();
    } else if (this.filteredOptions.length > 1) {
      announcementMessage = 'Found ' + this.filteredOptions.length + ' persons';
    }

    console.log('liveAnnouncer : ' + announcementMessage);

    this.liveAnnouncer.announce(announcementMessage, 'polite');
  }

  private initInternalForm() {
    this.formGroup = this.fb.group({});
    this.formGroup.controls[INTERNAL_FIELD_NAME] = new FormControl('', [RequirePersonMatch]);
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

  private setInternalValue(regId: string) {
    if (!isNullOrUndefined(regId)) {
      if (this.formGroup && this.formGroup.controls[INTERNAL_FIELD_NAME]) {
        this.personService
          .read(regId)
          .pipe(first())
          .subscribe((result: Person) => {
            this.filteredOptions = [result];
            this.formGroup.controls[INTERNAL_FIELD_NAME].patchValue(result);
          });
      }
    } else {
      this.formGroup.controls[INTERNAL_FIELD_NAME].reset();
    }
  }

  displayFn(person?: Person) {
    return person && person instanceof Person ? person.getNameAndEmployeeId() : undefined;
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
    private personService: PersonService,
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
    this._markAsTouched();
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
