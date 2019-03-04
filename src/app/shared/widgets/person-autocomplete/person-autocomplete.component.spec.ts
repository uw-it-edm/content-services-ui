import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { Observable, of } from 'rxjs';
import { A11yModule } from '@angular/cdk/a11y';
import { Person } from '../../shared/model/person';
import { PersonSearchResults } from '../../shared/model/person-search-results';
import { PersonAutocompleteComponent } from './person-autocomplete.component';
import { PersonService } from '../../providers/person.service';

class MockPersonService extends PersonService {
  constructor() {
    super(null, null);
  }

  read(regId: string) {
    const testPerson = new Person();
    testPerson.displayName = 'Test User';
    testPerson.firstName = 'Test';
    testPerson.lastName = 'User';
    testPerson.regId = 'ABCD';
    testPerson.priorRegIds = ['CDEF', 'GHIJ'];
    testPerson.employeeId = '12345';
    return of(testPerson);
  }

  autocomplete(term: string): Observable<PersonSearchResults> {
    const testPerson = new Person();
    testPerson.displayName = 'Test User';
    testPerson.firstName = 'Test';
    testPerson.lastName = 'User';
    testPerson.regId = 'ABCD';
    testPerson.priorRegIds = ['CDEF', 'GHIJ'];
    testPerson.employeeId = '12345';

    const personSearchResults = new PersonSearchResults();
    personSearchResults.totalElements = 1;
    personSearchResults.numberOfElements = 1;
    personSearchResults.content = [testPerson];
    return of(personSearchResults);
  }
}

describe('PersonAutocompleteComponent', () => {
  let component: PersonAutocompleteComponent;
  let fixture: ComponentFixture<PersonAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatAutocompleteModule, A11yModule],
      declarations: [PersonAutocompleteComponent],
      providers: [{ provide: PersonService, useValue: new MockPersonService() }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a person name', () => {
    const testPerson = new Person();
    testPerson.displayName = 'Test User';
    testPerson.firstName = 'Test';
    testPerson.lastName = 'User';
    testPerson.regId = 'ABCD';
    testPerson.priorRegIds = ['CDEF', 'GHIJ'];
    testPerson.employeeId = '12345';

    component.filteredOptions = [testPerson];
    const displayName = component.displayFn('ABCD');
    expect(displayName).toBe('User, Test (12345)');
  });

  it('should populate the initial value when provided', () => {
    component.ngAfterContentInit();
    component.writeValue('ABCD');

    expect(component.formGroup.controls['personAutocomplete'].value).toBe('ABCD');
  });

  it('should autocomplete', () => {
    component.formGroup.controls['personAutocomplete'].patchValue('User');
    fixture.detectChanges();

    expect(component.filteredOptions.length).toBe(1);
    const testPerson = new Person();
    testPerson.displayName = 'Test User';
    testPerson.firstName = 'Test';
    testPerson.lastName = 'User';
    testPerson.regId = 'ABCD';
    testPerson.priorRegIds = ['CDEF', 'GHIJ'];
    testPerson.employeeId = '12345';
    expect(component.filteredOptions).toEqual([testPerson]);
  });
});
