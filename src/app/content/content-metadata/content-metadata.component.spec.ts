import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMetadataComponent } from './content-metadata.component';
import { ContentItem } from '../shared/model/content-item';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatInputModule,
  MatNativeDateModule,
  MatOptionModule
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { StudentAutocompleteComponent } from '../../shared/widgets/student-autocomplete/student-autocomplete.component';
import { CheckboxInputComponent } from '../../shared/widgets/checkbox/checkbox-input.component';

class UserServiceMock extends UserService {
  constructor() {
    super(null);
  }

  getUser(): User {
    return new User('test');
  }
}

describe('ContentMetadataComponent', () => {
  let component: ContentMetadataComponent;
  let fixture: ComponentFixture<ContentMetadataComponent>;
  let defaultContentItem: ContentItem;
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [
          NoopAnimationsModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatDatepickerModule,
          MatNativeDateModule,
          ReactiveFormsModule,
          MatOptionModule,
          MatAutocompleteModule
        ],
        declarations: [ContentMetadataComponent, CheckboxInputComponent, StudentAutocompleteComponent],
        providers: [
          { provide: UserService, useValue: new UserServiceMock() },
          { provide: HttpClient, useValue: new HttpClient(null) }
        ]
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(ContentMetadataComponent);
          component = fixture.componentInstance;
        });
    })
  );

  beforeEach(() => {
    const editPageConfig = new ContentPageConfig();
    editPageConfig.pageName = 'test-edit-page';
    editPageConfig.fieldsToDisplay = [
      { name: '1', label: 'First' },
      { name: '2', label: 'Second' },
      { name: '3', label: 'Third' },
      { name: 'a', label: 'a' },
      { name: 'd', label: 'd', displayType: 'date' },
      { name: 't', label: 't', displayType: 'autocomplete', options: ['o1', 'o2', 'o3'] }
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
    defaultContentItem.metadata['t'] = 't';
    defaultContentItem.metadata['d'] = 1509519600000;
    component.contentItem$ = Observable.of(defaultContentItem);
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
  it('should contain mat-autocomplete', () => {
    const el = fixture.debugElement.nativeElement.querySelectorAll('mat-autocomplete');
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
      t: 't',
      d: new Date(1509519600000)
    });
  });
});
