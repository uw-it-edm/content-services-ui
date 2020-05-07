import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    testPerson.registeredFirstName = 'Test';
    testPerson.registeredLastName = 'User';
    testPerson.regId = 'ABCD';
    testPerson.priorRegIds = ['CDEF', 'GHIJ'];
    testPerson.employeeId = '12345';
    return of(testPerson);
  }

  autocomplete(term: string): Observable<PersonSearchResults> {
    const testPerson = new Person();
    testPerson.displayName = 'Test User';
    testPerson.registeredFirstName = 'Test';
    testPerson.registeredLastName = 'User';
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
      imports: [ReactiveFormsModule, MatAutocompleteModule, A11yModule, MatProgressSpinnerModule],
      declarations: [PersonAutocompleteComponent],
      providers: [{ provide: PersonService, useValue: new MockPersonService() }],
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
    testPerson.registeredFirstName = 'Test';
    testPerson.registeredLastName = 'User';
    testPerson.regId = 'ABCD';
    testPerson.priorRegIds = ['CDEF', 'GHIJ'];
    testPerson.employeeId = '12345';

    component.filteredOptions = [testPerson];
    const displayName = component.displayFn(testPerson);
    expect(displayName).toBe('User, Test (12345)');
  });

  it('should populate the initial value when provided', () => {
    component.ngAfterContentInit();
    component.writeValue('ABCD');

    expect(component.formGroup.controls['personAutocomplete'].value.regId).toBe('ABCD');
  });

  it('should know when internalField is invalid', () => {
    component.formGroup.controls['personAutocomplete'].patchValue(new Person());

    expect(component.formGroup.controls['personAutocomplete'].valid).toBeTruthy();
  });

  it('should know when internalField is valid', () => {
    component.formGroup.controls['personAutocomplete'].patchValue('User');
    expect(component.formGroup.controls['personAutocomplete'].invalid).toBeTruthy();
  });

  it('should autocomplete', fakeAsync(() => {
    component.formGroup.controls['personAutocomplete'].patchValue('User');
    tick(400); // Need to tick for longer than the debounceTime
    fixture.detectChanges();

    expect(component.filteredOptions.length).toBe(1, 'incorrect number of filtered options');
    const testPerson = new Person();
    testPerson.displayName = 'Test User';
    testPerson.registeredFirstName = 'Test';
    testPerson.registeredLastName = 'User';
    testPerson.regId = 'ABCD';
    testPerson.priorRegIds = ['CDEF', 'GHIJ'];
    testPerson.employeeId = '12345';
    expect(component.filteredOptions).toEqual([testPerson]);
  }));
});
