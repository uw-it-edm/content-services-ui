import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatChipList } from '@angular/material/chips';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { first, skip } from 'rxjs/operators';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { OptionsMultiselectComponent } from './options-multiselect.component';
import { SharedModule } from '../../shared.module';
import { FieldOptionService } from '../../providers/fieldoption.service';
import { DataApiValueService } from '../../providers/dataapivalue.service';
import { Field } from '../../../core/shared/model/field';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { MaterialConfigModule } from '../../../routing/material-config.module';

const fieldOptions: FieldOption[] = [
  new FieldOption('val1', 'display1 x'),
  new FieldOption('val2', 'display2 xy'),
  new FieldOption('val3', 'display3 xyz'),
];

describe('OptionsMultiselectComponent', () => {
  let component: OptionsMultiselectComponent;
  let fixture: ComponentFixture<OptionsMultiselectComponent>;
  let liveAnnouncerSpy: LiveAnnouncer;

  beforeEach(async(() => {
    const dataApiValueServiceSpy = jasmine.createSpyObj('DataApiValueService', ['listByType']);
    liveAnnouncerSpy = jasmine.createSpyObj('LiveAnnouncer', ['announce']);

    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, MaterialConfigModule],
      declarations: [],
      providers: [
        FieldOptionService,
        { provide: DataApiValueService, useValue: dataApiValueServiceSpy },
        { provide: LiveAnnouncer, useValue: liveAnnouncerSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsMultiselectComponent);
    component = fixture.componentInstance;

    const field = new Field();
    field.options = fieldOptions;
    component.fieldConfig = field;
    component.registerOnChange((val) => {});

    fixture.detectChanges();
  });

  it('should have a correct list of options on load', () => {
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

  it('should populate the chip list with the initial value from form model', () => {
    component.writeValue(['val1']);
    expect(component.selectedOptions[0].value).toBe('val1');
  });

  it('should clear the chip list when value from model is cleared', () => {
    component.writeValue(null);
    expect(component.selectedOptions.length).toBe(0);
  });

  it('should disable the chip list when component is disabled', () => {
    component.writeValue(['val1']);
    fixture.detectChanges();

    const chipList: MatChipList = fixture.debugElement.query(By.directive(MatChipList)).componentInstance;

    expect(component.filterInputControl.disabled).toBeFalse();
    expect(chipList.disabled).toBeFalse();

    component.setDisabledState(true);
    fixture.detectChanges();

    expect(component.filterInputControl.disabled).toBeTrue();
    expect(chipList.disabled).toBeTrue();
  });

  it('should update the form model and add a chip when option is selected', () => {
    let currentValues: string[];
    component.registerOnChange((val) => (currentValues = val));
    component.addOptionToMultiSelect(fieldOptions[1]);
    fixture.detectChanges();

    const chipList: MatChipList = fixture.debugElement.query(By.directive(MatChipList)).componentInstance;

    expect(component.selectedOptions[0].value).toEqual('val2');
    expect(currentValues).toEqual(['val2']);
    expect(chipList.chips.length).toEqual(1);
    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Selected display2 xy.', 'polite');
  });

  it('should set form model to empty array when the last option is removed', () => {
    component.writeValue([fieldOptions[1].value]);
    expect(component.selectedOptions[0].value).toBe(fieldOptions[1].value);

    let lastValue: any;
    component.registerOnChange((val) => (lastValue = val));
    component.removeOptionFromMultiSelect(fieldOptions[1]);
    fixture.detectChanges();

    expect(component.selectedOptions.length).toBe(0);
    expect(lastValue).toEqual([]);
  });

  it('should filter the options list when option is selected', (done: DoneFn) => {
    component.filteredOptions$.pipe(skip(1), first()).subscribe((options) => {
      // The observable chain starts with all options available, the second value will be the filtered results.
      expect(options.length).toBe(2, 'Expect OptionsAutocompleteComponent to have 2 options.');
      expect(options[0].displayValue).toBe('display1 x');
      expect(options[1].displayValue).toBe('display3 xyz');
      done();
    });

    component.addOptionToMultiSelect(fieldOptions[1]);
    fixture.detectChanges();
  });

  it('should update filter options when removing an option', () => {
    let filteredOptions: FieldOption[] = [];
    const subscription = component.filteredOptions$.subscribe((options) => (filteredOptions = options));

    expect(filteredOptions.length).toBe(3, 'Expect to have 3 options on init.');

    component.addOptionToMultiSelect(fieldOptions[1]);
    fixture.detectChanges();

    expect(filteredOptions.length).toBe(2, 'Expect to have 2 options after adding option.');
    expect(component.selectedOptions.length).toEqual(1);

    component.removeOptionFromMultiSelect(fieldOptions[1]);
    fixture.detectChanges();

    expect(filteredOptions.length).toBe(3, 'Expect to have 3 options after removing option.');
    expect(component.selectedOptions.length).toEqual(0);

    subscription.unsubscribe();
  });

  it('should default maxSelection count to max value if not specified in config', () => {
    expect(component.maxSelectionCount).toEqual(Number.MAX_VALUE);
  });

  it('should update the placeholder of control if maxSelectionCount is set', () => {
    component.placeholder = 'test placeholder';
    fixture.detectChanges();
    expect(component.multiSelectLabelText).toEqual('test placeholder');

    component.maxSelectionCount = 3;
    fixture.detectChanges();
    expect(component.multiSelectLabelText).toEqual('test placeholder (select up to 3)');
  });

  it('should perform no operation when option selected and already at max selection count', () => {
    let filteredOptions: FieldOption[] = [];
    const subscription = component.filteredOptions$.subscribe((options) => (filteredOptions = options));

    component.maxSelectionCount = 1;

    component.addOptionToMultiSelect(fieldOptions[1]);
    expect(component.selectedOptions.length).toEqual(1);
    expect(filteredOptions.length).toEqual(2);

    component.addOptionToMultiSelect(fieldOptions[2]);
    expect(component.selectedOptions.length).toEqual(1);
    expect(filteredOptions.length).toEqual(2);

    subscription.unsubscribe();
  });

  it('should disable the options list when max selection count is reached', () => {
    const autoComplete: MatAutocomplete = fixture.debugElement.query(By.directive(MatAutocomplete)).componentInstance;

    component.maxSelectionCount = 1;
    fixture.detectChanges();
    expect(autoComplete.options.first.disabled).toBeFalsy();

    component.addOptionToMultiSelect(fieldOptions[1]);
    fixture.detectChanges();
    expect(autoComplete.options.first.disabled).toBeTruthy();

    component.removeOptionFromMultiSelect(fieldOptions[1]);
    fixture.detectChanges();
    expect(autoComplete.options.first.disabled).toBeFalsy();
  });

  it('should announce the selection counts when adding and removing options', () => {
    component.maxSelectionCount = 1;
    component.addOptionToMultiSelect(fieldOptions[1]);
    fixture.detectChanges();
    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Selected display2 xy. Selected 1 of 1 options allowed.', 'polite');

    component.removeOptionFromMultiSelect(fieldOptions[1]);
    fixture.detectChanges();
    expect(liveAnnouncerSpy.announce).toHaveBeenCalledWith('Removed display2 xy. Selected 0 of 1 options allowed.', 'polite');
  });
});
