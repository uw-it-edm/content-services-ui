import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { ContentMetadataComponent } from './content-metadata.component';
import { ContentItem } from '../shared/model/content-item';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { StudentAutocompleteComponent } from '../../shared/widgets/student-autocomplete/student-autocomplete.component';
import { CheckboxInputComponent } from '../../shared/widgets/checkbox/checkbox-input.component';
import { TimestampPickerComponent } from '../../shared/widgets/timestamp-picker/timestamp-picker.component';
import { FieldOption } from '../../core/shared/model/field/field-option';
import { OptionsInputComponent } from '../../shared/widgets/options-input/options-input.component';
import { OptionsAutocompleteComponent } from '../../shared/widgets/options-autocomplete/options-autocomplete.component';
import { OptionsMultiselectComponent } from '../../shared/widgets/options-multiselect/options-multiselect.component';
import { CourseInputComponent } from '../../shared/widgets/course-input/course-input.component';
import { Field } from '../../core/shared/model/field';
import { DataApiValueService } from '../../shared/providers/dataapivalue.service';
import { FieldOptionService } from '../../shared/providers/fieldoption.service';
import { PersonAutocompleteComponent } from '../../shared/widgets/person-autocomplete/person-autocomplete.component';
import { CustomTextDirective } from '../../shared/directives/custom-text/custom-text.directive';
import { By } from '@angular/platform-browser';

function getContentItem(): ContentItem {
  const contentItem = new ContentItem();
  contentItem.id = '1';
  contentItem.label = 'test label';
  contentItem.metadata['1'] = 'one';
  contentItem.metadata['2'] = 'two';
  contentItem.metadata['3'] = 'three';
  contentItem.metadata['a'] = 'a';
  contentItem.metadata['b'] = 'asdf';
  contentItem.metadata['parentKey'] = 'parent1';
  contentItem.metadata['d'] = 1509519600000;
  contentItem.metadata['n'] = 1220.3;
  return contentItem;
}

function getPageConfig({ addCascadingSelects }: { addCascadingSelects?: boolean } = {}): ContentPageConfig {
  const editPageConfig = new ContentPageConfig();
  editPageConfig.pageName = 'test-edit-page';
  editPageConfig.viewPanel = false;
  editPageConfig.fieldsToDisplay = [
    Object.assign(new Field(), { key: '1', label: 'First' }),
    Object.assign(new Field(), { key: '2', label: 'Second' }),
    Object.assign(new Field(), { key: '3', label: 'Third' }),
    Object.assign(new Field(), { key: 'a', label: 'a' }),
    Object.assign(new Field(), { key: 'd', label: 'd', displayType: 'date' }),
    Object.assign(new Field(), {
      key: 'parentKey',
      label: 'Parent Label',
      displayType: 'select',
      options: [new FieldOption('parent1'), new FieldOption('parent2')],
    }),
    Object.assign(new Field(), { key: 'n', label: 'number', displayType: 'currency', dataType: 'number' }),
  ];

  if (addCascadingSelects) {
    const childField = Object.assign(new Field(), {
      key: 'childKey',
      label: 'Child Label',
      displayType: 'select',
      dynamicSelectConfig: {
        type: 'child-type',
        labelPath: 'label',
        parentFieldConfig: {
          parentType: 'parent-type',
          key: 'parentKey',
        },
      },
    });

    editPageConfig.fieldsToDisplay.push(childField);
  }

  return editPageConfig;
}

describe('ContentMetadataComponent', () => {
  let component: ContentMetadataComponent;
  let fixture: ComponentFixture<ContentMetadataComponent>;
  let dataApiValueServiceSpy: DataApiValueService;

  beforeEach(async(() => {
    dataApiValueServiceSpy = jasmine.createSpyObj('DataApiValueService', ['listByType', 'listByTypeAndParent']);
    const userServiceSpy: UserService = jasmine.createSpyObj('UserService', {
      getUser: new User('test'),
    });

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule,
        MatOptionModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatIconModule,
      ],
      declarations: [
        ContentMetadataComponent,
        CheckboxInputComponent,
        OptionsInputComponent,
        OptionsAutocompleteComponent,
        OptionsMultiselectComponent,
        CourseInputComponent,
        StudentAutocompleteComponent,
        PersonAutocompleteComponent,
        TimestampPickerComponent,
        CustomTextDirective,
      ],
      providers: [
        FieldOptionService,
        { provide: DataApiValueService, useValue: dataApiValueServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: HttpClient, useValue: new HttpClient(null) },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentMetadataComponent);

    (<any>dataApiValueServiceSpy.listByTypeAndParent).withArgs('child-type', 'parent-type', 'parent1').and.returnValue(
      of({
        content: [
          { value: 'parent1-child1', displayValue: 'Parent 1 - Child 1' },
          { value: 'parent1-child2', displayValue: 'Parent 1 - Child 2' },
        ],
      })
    );

    (<any>dataApiValueServiceSpy.listByTypeAndParent).withArgs('child-type', 'parent-type', 'parent2').and.returnValue(
      of({
        content: [
          { value: 'parent2-child1', displayValue: 'Parent 2 - Child 1' },
          { value: 'parent2-child2', displayValue: 'Parent 2 - Child 2' },
        ],
      })
    );

    component = fixture.componentInstance;
    component.pageConfig = getPageConfig();
    component.contentItem = getContentItem();
    component.formGroup = new FormGroup({});

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should contain the defined fields in the proper order', () => {
    const input = fixture.debugElement.nativeElement.querySelectorAll('input');
    expect(input[0].name).toBe('1');
    expect(input[1].name).toBe('2');
    expect(input[2].name).toBe('3');
    expect(input[3].name).toBe('a');
  });

  it('should contain the defined field label placeholders', () => {
    const input = fixture.debugElement.nativeElement.querySelectorAll('input');
    expect(input[0].placeholder).toBe('First');
    expect(input[1].placeholder).toBe('Second');
    expect(input[2].placeholder).toBe('Third');
    expect(input[3].placeholder).toBe('a');
  });

  it('should contain mat-select', () => {
    const el = fixture.debugElement.nativeElement.querySelectorAll('mat-select');
    expect(el.length).toBe(1);
  });

  it('should contain mat-datepicker', () => {
    const el = fixture.debugElement.nativeElement.querySelectorAll('mat-datepicker');
    expect(el.length).toBe(1);
  });

  it('should contain the default values', () => {
    const metaDataGroup = component.formGroup.controls['metadata'];
    expect(metaDataGroup.value).toEqual({
      '1': 'one',
      '2': 'two',
      '3': 'three',
      a: 'a',
      parentKey: 'parent1',
      d: 1509519600000,
      n: 1220.3,
    });
  });

  it('should add $ prefix if displayType=currency', () => {
    const prefixElement = fixture.debugElement.query(By.css('.mat-form-field-prefix'));
    expect(prefixElement.nativeElement.textContent).toContain('$');
  });

  describe('built in validators', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ContentMetadataComponent);

      component = fixture.componentInstance;
      component.pageConfig = getPageConfig({ addCascadingSelects: true });
      component.formGroup = new FormGroup({});
    });

    it('should mark number field as invalid if it fails number validation', () => {
      fixture.detectChanges();
      const control: FormControl = component.formGroup.get('metadata').get('n') as FormControl;

      // test valid number
      control.setValue('1234');
      fixture.detectChanges();
      expect(control.valid).toBeTrue();

      // test invalid number
      control.setValue('words');
      fixture.detectChanges();
      expect(control.valid).toBeFalse();

      // test valid large decimal
      control.setValue('12.34324');
      fixture.detectChanges();
      expect(control.valid).toBeTrue();

      // test valid short decimal
      control.setValue('12.1');
      fixture.detectChanges();
      expect(control.valid).toBeTrue();

      // test invalid decimal separator
      control.setValue('12a34');
      fixture.detectChanges();
      expect(control.valid).toBeFalse();

      // test invalid decimal remainder
      control.setValue('12.');
      control.markAllAsTouched(); // Mark as touched for the error message to show.
      fixture.detectChanges();
      expect(control.valid).toBeFalse();

      const errorElement = fixture.debugElement.query(By.css('.mat-error'));
      expect(errorElement.nativeElement.textContent).toContain('You must enter a valid number (only digits and optional decimal point).');
    });

    it('should mark form as invalid when no fields are set if the empty form validator is enabled', () => {
      component.enableEmptyFormValidator = true;
      fixture.detectChanges();

      // verify form should be invalid on load
      expect(component.formGroup.valid).toBeFalse();

      // verify form is valid after setting one field
      component.formGroup.get('metadata').get('1').setValue('one');
      fixture.detectChanges();
      expect(component.formGroup.valid).toBeTrue();

      // verify form goes back to invalid after clearing the field.
      component.formGroup.get('metadata').get('1').reset();
      fixture.detectChanges();
      expect(component.formGroup.valid).toBeFalse();
    });

    it('should mark form as invalid when field is set to empty array if form validator is enabled', () => {
      component.enableEmptyFormValidator = true;
      fixture.detectChanges();

      // verify form should be invalid on load
      expect(component.formGroup.valid).toBeFalse();

      // verify form is still invalid after setting a field to empty array.
      component.formGroup.get('metadata').get('1').setValue([]);
      fixture.detectChanges();
      expect(component.formGroup.valid).toBeFalse();

      // verify form becomes valid when setting field to array with value.
      component.formGroup.get('metadata').get('1').setValue(['one']);
      fixture.detectChanges();
      expect(component.formGroup.valid).toBeTrue();
    });

    it('should mark form as invalid if parent select has value and child select does not when validator is enabled', fakeAsync(() => {
      component.enableCascadingFieldsValidator = true;
      fixture.detectChanges();

      // verify form should be valid on load
      expect(component.formGroup.valid).toBeTrue();

      // select parent value, verify form should be invalid
      component.formGroup.get('metadata').get('parentKey').setValue('parent1');
      fixture.detectChanges();
      expect(component.formGroup.valid).toBeFalse();

      // select child value, verify form should be valid
      component.formGroup.get('metadata').get('childKey').setValue('parent1-child1');
      fixture.detectChanges();
      expect(component.formGroup.valid).toBeTrue();

      // select new parent value, verify form should be invalid and child is cleared.
      component.formGroup.get('metadata').get('parentKey').setValue('parent2');
      fixture.detectChanges();
      tick(1000);
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('metadata').get('childKey').value).toBeNull();
    }));

    it('should clear validation errors when component is reset', fakeAsync(() => {
      component.enableCascadingFieldsValidator = true;
      fixture.detectChanges();

      // verify form should be valid on load
      expect(component.formGroup.valid).toBeTrue();

      // select parent value, verify form should be invalid
      component.formGroup.get('metadata').get('parentKey').setValue('parent1');
      fixture.detectChanges();
      expect(component.formGroup.valid).toBeFalse();

      // reset component, verify that form is valid.
      component.reset();
      fixture.detectChanges();
      expect(component.formGroup.valid).toBeTrue();
    }));
  });
});
