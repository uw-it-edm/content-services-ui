import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMetadataComponent } from './content-metadata.component';
import { ContentItem } from '../shared/model/content-item';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatInputModule,
  MatNativeDateModule,
  MatOptionModule,
  MatSelectModule
} from '@angular/material';
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
import { Field } from '../../core/shared/model/field';
import { DataApiValueService } from '../../shared/providers/dataapivalue.service';
import { PersonAutocompleteComponent } from '../../shared/widgets/person-autocomplete/person-autocomplete.component';

class UserServiceMock extends UserService {
  constructor() {
    super(null, null, null);
  }

  getUser(): User {
    return new User('test');
  }
}

describe('ContentMetadataComponent', () => {
  let component: ContentMetadataComponent;
  let fixture: ComponentFixture<ContentMetadataComponent>;
  let defaultContentItem: ContentItem;
  beforeEach(async(() => {
    const dataApiValueServiceSpy = jasmine.createSpyObj('DataApiValueService', ['listByType']);

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
        MatSelectModule
      ],
      declarations: [
        ContentMetadataComponent,
        CheckboxInputComponent,
        OptionsInputComponent,
        StudentAutocompleteComponent,
        PersonAutocompleteComponent,
        TimestampPickerComponent
      ],
      providers: [
        { provide: DataApiValueService, useValue: dataApiValueServiceSpy },
        { provide: UserService, useValue: new UserServiceMock() },
        { provide: HttpClient, useValue: new HttpClient(null) }
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContentMetadataComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    const editPageConfig = new ContentPageConfig();
    editPageConfig.pageName = 'test-edit-page';
    editPageConfig.fieldsToDisplay = [
      Object.assign(new Field(), { key: '1', label: 'First' }),
      Object.assign(new Field(), { key: '2', label: 'Second' }),
      Object.assign(new Field(), { key: '3', label: 'Third' }),
      Object.assign(new Field(), { key: 'a', label: 'a' }),
      Object.assign(new Field(), { key: 'd', label: 'd', displayType: 'date' }),
      Object.assign(new Field(), {
        key: 't',
        label: 't',
        displayType: 'select',
        options: [new FieldOption('o1'), new FieldOption('o2'), new FieldOption('o3')]
      })
    ];
    editPageConfig.viewPanel = false;
    component.pageConfig = editPageConfig;

    defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata['1'] = 'one';
    defaultContentItem.metadata['2'] = 'two';
    defaultContentItem.metadata['3'] = 'three';
    defaultContentItem.metadata['a'] = 'a';
    defaultContentItem.metadata['b'] = 'asdf';
    defaultContentItem.metadata['t'] = 'o2';
    defaultContentItem.metadata['d'] = 1509519600000;
    component.contentItem = defaultContentItem;
    component.formGroup = new FormGroup({});

    fixture.detectChanges();
    component.ngOnInit();
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
      t: 'o2',
      d: 1509519600000
    });
  });
});
