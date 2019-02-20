import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionsInputComponent } from './options-input.component';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { Field } from '../../../core/shared/model/field';
import { SharedModule } from '../../shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectChange } from '@angular/material';
import { DataApiValueService } from '../../providers/dataapivalue.service';

describe('OptionsInputComponent', () => {
  let component: OptionsInputComponent;
  let fixture: ComponentFixture<OptionsInputComponent>;

  beforeEach(async(() => {
    const dataApiValueServiceSpy = jasmine.createSpyObj('DataApiValueService', ['listByType']);
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [],
      providers: [{ provide: DataApiValueService, useValue: dataApiValueServiceSpy }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsInputComponent);
    component = fixture.componentInstance;

    const field = new Field();
    field.options = [new FieldOption('val1', 'displayVal1'), new FieldOption('val2')];
    component.fieldConfig = field;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the initial value in the formGroup', () => {
    component.writeValue('val1');

    expect(component.formGroup.controls['optionsForm'].value).toBe('val1');
  });

  it('should update the model when a value is selected', () => {
    component.onSelect(new MatSelectChange(null, 'val2'));

    expect(component.value).toBe('val2');
  });

  it('should have a correct list of options', () => {
    component.options$.subscribe(options => {
      expect(options.length).toBe(2);
      expect(options[0].value).toBe('val1');
      expect(options[0].displayValue).toBe('displayVal1');
      expect(options[1].value).toBe('val2');
      expect(options[1].displayValue).toBe('val2');
    });
  });
});
