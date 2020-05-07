import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OptionsInputComponent } from './options-input.component';
import { FieldOption } from '../../../core/shared/model/field/field-option';
import { Field } from '../../../core/shared/model/field';
import { SharedModule } from '../../shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectChange } from '@angular/material/select';
import { DataApiValueService } from '../../providers/dataapivalue.service';

describe('OptionsInputComponent', () => {
  let component: OptionsInputComponent;
  let fixture: ComponentFixture<OptionsInputComponent>;

  beforeEach(async(() => {
    const dataApiValueServiceSpy = jasmine.createSpyObj('DataApiValueService', ['listByType']);
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [],
      providers: [{ provide: DataApiValueService, useValue: dataApiValueServiceSpy }],
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
    component.options$.subscribe((options) => {
      expect(options.length).toBe(2);
      expect(options[0].value).toBe('val1');
      expect(options[0].displayValue).toBe('displayVal1');
      expect(options[1].value).toBe('val2');
      expect(options[1].displayValue).toBe('val2');
    });
  });
});

@Component({
  template: `
    <div [formGroup]="formGroup">
      <app-options-input
        [placeholder]="'testPlaceHolder'"
        [formControlName]="'testFormControlName'"
        [fieldConfig]="field"
        [parentControl]="formGroup"
        [id]="'test-custom-input'"
      >
      </app-options-input>
    </div>
  `,
})
class TestHostComponent {
  public field: Field;
  public formGroup: FormGroup;

  constructor() {
    this.field = new Field();
    this.field.options = [new FieldOption('optionOneValue', 'optionOneDisplayValue')];
    this.formGroup = new FormGroup({
      testFormControlName: new FormControl(this.field.options[0].value),
    });
  }
}

describe('OptionsInputComponent with host', () => {
  let componentElement: HTMLElement;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    const dataApiValueServiceSpy = jasmine.createSpyObj('DataApiValueService', ['listByType']);
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [TestHostComponent],
      providers: [{ provide: DataApiValueService, useValue: dataApiValueServiceSpy }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    componentElement = fixture.debugElement.queryAll(By.css('mat-select'))[0].nativeElement;

    fixture.detectChanges();
  });

  it('should render aria-label attribute set to its label and option value', async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(componentElement.getAttribute('aria-label')).toEqual('testPlaceHolder optionOneDisplayValue');
    });
  }));
});
