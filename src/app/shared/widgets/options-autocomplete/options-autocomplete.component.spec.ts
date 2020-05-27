import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { OptionsAutocompleteComponent } from './options-autocomplete.component';
import { SharedModule } from '../../shared.module';
import { FieldOptionService } from '../../providers/fieldoption.service';
import { DataApiValueService } from '../../providers/dataapivalue.service';
import { Field } from '../../../core/shared/model/field';
import { FieldOption } from '../../../core/shared/model/field/field-option';

const fieldOptions: FieldOption[] = [
  new FieldOption('val1', 'display1 x'),
  new FieldOption('val2', 'display2 xy'),
  new FieldOption('val3', 'display3 xyz'),
];

describe('OptionsAutocompleteComponent', () => {
  const getInputControl = () => component.formGroup.controls[component.internalFieldName];
  let component: OptionsAutocompleteComponent;
  let fixture: ComponentFixture<OptionsAutocompleteComponent>;

  beforeEach(async(() => {
    const dataApiValueServiceSpy = jasmine.createSpyObj('DataApiValueService', ['listByType']);
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [],
      providers: [FieldOptionService, { provide: DataApiValueService, useValue: dataApiValueServiceSpy }],
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
    const option: FieldOption = getInputControl().value;

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
    expect(getInputControl().disabled).toBeFalse();

    component.setDisabledState(true);

    expect(getInputControl().disabled).toBeTrue();
  });

  it('should update the component value when option is selected', () => {
    let currentValue: string;
    component.registerOnChange(val => currentValue = val);
    component.optionSelected(fieldOptions[1]);

    expect(currentValue).toBe('val2');
  });

  it('should filter the options after user types in textbox', async(() => {
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.dispatchEvent(new Event('focusin'));
    inputElement.value = 'xy';
    inputElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const matOptions = document.querySelectorAll('mat-option');
      expect(matOptions.length).toBe(2, 'Expect OptionsAutocompleteComponent to have 2 options.');
    });
  }));
});
