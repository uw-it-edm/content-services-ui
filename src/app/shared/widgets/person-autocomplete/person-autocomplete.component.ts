import { startWith, takeUntil } from 'rxjs/operators';
import {
  AfterContentInit,
  AfterViewInit,
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
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatFormFieldControl,
  mixinErrorState
} from '@angular/material';
import { FocusMonitor } from '@angular/cdk/a11y';
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

/* tslint:disable:member-ordering use-host-property-decorator*/
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
    AfterViewInit,
    ControlValueAccessor,
    MatFormFieldControl<string>,
    CanUpdateErrorState,
    AfterContentInit,
    DoCheck,
    OnDestroy {
  // Component logic
  formGroup: FormGroup;

  get internalFieldName(): string {
    return INTERNAL_FIELD_NAME;
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
    this.formGroup.controls[INTERNAL_FIELD_NAME].valueChanges
      .pipe(
        startWith(null),
        takeUntil(this.componentDestroyed)
      )
      .subscribe((term: string) => {
        if (this.initialized) {
          if (term && term.trim().length > 1) {
            let person: Person = null;
            if (this.filteredOptions) {
              person = this.filteredOptions.find((p: Person) => p.regId === term);
            }

            if (person) {
              this.filteredOptions = [person];
            } else {
              this.personService
                .autocomplete(term)
                .pipe(takeUntil(this.componentDestroyed))
                .subscribe((results: PersonSearchResults) => {
                  this.filteredOptions = results.content;
                });
            }
          } else if (!term || term.trim().length === 0) {
            // if empty, the user probably wants to delete the value
            this._propagateChanges(null);
          }
        }
      });
  }

  private initInternalForm() {
    this.formGroup = this.fb.group({});
    this.formGroup.controls[INTERNAL_FIELD_NAME] = new FormControl();
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
          .pipe(takeUntil(this.componentDestroyed))
          .subscribe((result: Person) => {
            this.filteredOptions = [result];
            const emptyPerson = new Person();
            emptyPerson.displayName = 'none';
            this.filteredOptions.unshift(emptyPerson);
            this.formGroup.controls[INTERNAL_FIELD_NAME].patchValue(result.regId);
          });
      }
    } else {
      this.formGroup.controls[INTERNAL_FIELD_NAME].reset();
    }
  }

  onSelect(event: MatAutocompleteSelectedEvent) {
    console.log('select ' + event.option.value);
    this._propagateChanges(event.option.value);
  }

  get displayFn() {
    return (regId: string) => {
      if (this.filteredOptions && regId) {
        const person: Person = this.filteredOptions.find((p: Person) => p.regId === regId);
        return person ? Person.convertToDisplayName(person) : null;
      }
      return null;
    };
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

  validate() {
    // check if the value is valid
    const regId =
      this.formGroup &&
      this.formGroup.controls[INTERNAL_FIELD_NAME] &&
      this.formGroup.controls[INTERNAL_FIELD_NAME].value;
    let person: Person = null;
    if (this.filteredOptions && !isNullOrUndefined(regId)) {
      person = this.filteredOptions.find((p: Person) => p.regId === regId);
    }

    // clear the value if the value is invalid
    if (!person && !isNullOrUndefined(regId)) {
      this.setInternalValue(null);
    }
  }

  ngAfterViewInit() {
    this.trigger.panelClosingActions.subscribe(e => {
      if (!(e && e.source)) {
        // user did not select from the list
        this.validate();
        this.trigger.closePanel();
      }
    });
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
