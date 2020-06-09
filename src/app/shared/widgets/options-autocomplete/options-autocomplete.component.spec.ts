import { ComponentFixture, async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { of } from 'rxjs';
import { first, skip } from 'rxjs/operators';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { OptionsAutocompleteComponent } from './options-autocomplete.component';
import { SharedModule } from '../../shared.module';
import { FieldOptionService } from '../../providers/fieldoption.service';
import { DataApiValueService } from '../../providers/dataapivalue.service';
import { Field } from '../../../core/shared/model/field';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { AbstractControl, FormControl } from '@angular/forms';
import { DynamicSelectConfig } from '../../../core/shared/model/field/dynamic-select-config';
import { ParentFieldConfig } from '../../../core/shared/model/field/parent-field-config';

const fieldOptions: FieldOption[] = [
  new FieldOption('val1', 'display1 x'),
  new FieldOption('val2', 'display2 xy'),
  new FieldOption('val3', 'display3 xyz'),
];

const fieldOptions2: FieldOption[] = [
  new FieldOption('val2.1', 'display2.1 x'),
  new FieldOption('val2.2', 'display2.2 xy'),
  new FieldOption('val2.3', 'display2.3 xyz'),
];

describe('OptionsAutocompleteComponent', () => {
  let component: OptionsAutocompleteComponent;
  let fixture: ComponentFixture<OptionsAutocompleteComponent>;
  let liveAnnouncerSpy: LiveAnnouncer;

  beforeEach(async(() => {
    const dataApiValueServiceSpy = jasmine.createSpyObj('DataApiValueService', ['listByType']);
    liveAnnouncerSpy = jasmine.createSpyObj('LiveAnnouncer', ['announce']);

    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [],
      providers: [
        FieldOptionService,
        { provide: DataApiValueService, useValue: dataApiValueServiceSpy },
        { provide: LiveAnnouncer, useValue: liveAnnouncerSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsAutocompleteComponent);
    component = fixture.componentInstance;

    const field = new Field();
    field.options = fieldOptions;
    component.fieldConfig = field;

    fixture.detectChanges();
  });

  it('should populate the initial value in the formGroup control', () => {
    component.writeValue('val1');

    const option: FieldOption = component.filterInputControl.value;

    expect(option.value).toBe('val1');
  });

  it('should have a correct list of options', () => {
    component.filteredOptions$.subscribe((options) => {
      expect(options.length).toBe(3);
      expect(options[0].value).toBe('val1');
      expect(options[0].displayValue).toBe('display1 x');
      expect(options[1].value).toBe('val2');
      expect(options[1].displayValue).toBe('display2 xy');
      expect(options[2].value).toBe('val3');
      expect(options[2].displayValue).toBe('display3 xyz');
    });
  });

  it('should disable the formGroup control when component is disabled', () => {
    expect(component.filterInputControl.disabled).toBeFalse();

    component.setDisabledState(true);

    expect(component.filterInputControl.disabled).toBeTrue();
  });

  it('should update the component value when option is selected', () => {
    let currentValue: string;
    component.registerOnChange(val => currentValue = val);
    component.optionSelected(fieldOptions[1]);

    expect(currentValue).toBe('val2');

    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Selected display2 xy', 'polite');
  });

  it('should filter the options after user types in textbox', (done: DoneFn) => {
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    component.filteredOptions$.pipe(skip(1), first()).subscribe(options => {
      // The observable chain starts with all options available, the second value will be the filtered results.
      expect(options.length).toBe(2, 'Expect OptionsAutocompleteComponent to have 2 options.');
      done();
    });

    inputElement.dispatchEvent(new Event('focusin'));
    inputElement.value = 'xy';
    inputElement.dispatchEvent(new Event('input'));
  });

  it('should revert to the latest valid option if options list closes while invalid value is on the input', () => {
    component.registerOnChange(val => {});
    component.optionSelected(fieldOptions[1]);

    component.filterInputControl.setValue('invalid');

    component.optionListClosed();
    fixture.detectChanges();

    expect(component.filterInputControl.value).toBe(fieldOptions[1]);
  });

  it('should announce results to screen reader after user types in textbox with more than one match', fakeAsync(() => {
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.dispatchEvent(new Event('focusin'));
    inputElement.value = 'xy';
    inputElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    tick(500);

    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Found 2 results.', 'polite');
  }));

  it('should announce results to screen reader after user types in textbox with only 1 match', fakeAsync(() => {
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.dispatchEvent(new Event('focusin'));
    inputElement.value = 'xyz';
    inputElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    tick(500);

    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Found one result: display3 xyz.', 'polite');
  }));

  it('should announce results to screen reader after user types in textbox with no matches', fakeAsync(() => {
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.dispatchEvent(new Event('focusin'));
    inputElement.value = 'no matches';
    inputElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    tick(500);

    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Found no results.', 'polite');
  }));
});

describe('OptionsAutocompleteComponent with parent control', () => {
  let component: OptionsAutocompleteComponent;
  let fixture: ComponentFixture<OptionsAutocompleteComponent>;
  let parentControl: AbstractControl;

  beforeEach(async(() => {
    const fieldOptionServiceSpy = jasmine.createSpyObj('FieldOptionService', ['getFieldOptions', 'getOptionsFromParent']);
    fieldOptionServiceSpy.getFieldOptions.and.returnValue(of(fieldOptions));
    fieldOptionServiceSpy.getOptionsFromParent.and.returnValue(of(fieldOptions2));

    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [],
      providers: [{ provide: FieldOptionService, useValue: fieldOptionServiceSpy }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsAutocompleteComponent);
    component = fixture.componentInstance;
    parentControl = new FormControl('parent1');

    const fieldConfig = component.fieldConfig = new Field();
    const dynamicConfig = fieldConfig.dynamicSelectConfig = new DynamicSelectConfig();
    const parentConfig = dynamicConfig.parentFieldConfig = new ParentFieldConfig();

    dynamicConfig.type = 'child-type';
    dynamicConfig.labelPath = 'label';

    parentConfig.parentType = 'parent-type';
    parentConfig.key = 'parentTypeWithFilter';

    component.fieldConfig = fieldConfig;
    component.parentControl = parentControl;
    fixture.detectChanges();
  });

  it('should clear the filter control when the parent value changes', () => {
    component.registerOnChange(val => {});
    component.filterInputControl.setValue(fieldOptions[1].value);
    fixture.detectChanges();

    parentControl.setValue('new parent');
    fixture.detectChanges();

    expect(component.filterInputControl.value).toBe(null);
  });
});
