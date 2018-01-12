import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxInputComponent } from './checkbox-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material';
import { Field } from '../../../core/shared/model/field';
import { CheckboxOptions } from '../../../core/shared/model/field/checkbox-options';

describe('CheckboxInput', () => {
  let component: CheckboxInputComponent;
  let fixture: ComponentFixture<CheckboxInputComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, MatCheckboxModule],
        declarations: [CheckboxInputComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxInputComponent);
    component = fixture.componentInstance;

    const field = new Field();
    const checkboxOptions = new CheckboxOptions();
    checkboxOptions.uncheckedValue = 'notchecked';
    checkboxOptions.checkedValue = 'checked';
    field.checkboxOptions = checkboxOptions;
    component.fieldConfig = field;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the specified not checked value when checkbox is unchecked', () => {
    const matCheckboxChange = new MatCheckboxChange();
    matCheckboxChange.checked = false;
    component.internalCheckboxUpdated(matCheckboxChange);
    expect(component.value).toEqual('notchecked');
  });

  it('should have the specified  checked value when checkbox is checked', () => {
    const matCheckboxChange = new MatCheckboxChange();
    matCheckboxChange.checked = true;
    component.internalCheckboxUpdated(matCheckboxChange);
    expect(component.value).toEqual('checked');
  });
});
