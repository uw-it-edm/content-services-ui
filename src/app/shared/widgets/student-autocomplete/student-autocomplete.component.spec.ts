import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { StudentAutocompleteComponent } from './student-autocomplete.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatProgressSpinnerModule } from '@angular/material';
import { Observable, of } from 'rxjs';
import { StudentService } from '../../providers/student.service';
import { StudentSearchResults } from '../../shared/model/student-search-results';
import { A11yModule } from '@angular/cdk/a11y';
import { Student } from '../../shared/model/student';

class MockStudentService extends StudentService {
  constructor() {
    super(null, null);
  }

  read(studentNumber: string) {
    const testStudent = new Student();
    testStudent.displayName = 'Test User';
    testStudent.firstName = 'Test';
    testStudent.lastName = 'User';
    testStudent.studentNumber = '1234';
    return of(testStudent);
  }

  autocomplete(term: string): Observable<StudentSearchResults> {
    const testStudent = new Student();
    testStudent.displayName = 'Test User';
    testStudent.firstName = 'Test';
    testStudent.lastName = 'User';
    testStudent.studentNumber = '1234';

    const studentSearchResults = new StudentSearchResults();
    studentSearchResults.totalElements = 1;
    studentSearchResults.numberOfElements = 1;
    studentSearchResults.content = [testStudent];
    return of(studentSearchResults);
  }
}

describe('StudentAutocompleteComponent', () => {
  let component: StudentAutocompleteComponent;
  let fixture: ComponentFixture<StudentAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatAutocompleteModule, A11yModule, MatProgressSpinnerModule],
      declarations: [StudentAutocompleteComponent],
      providers: [{ provide: StudentService, useValue: new MockStudentService() }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a student name', () => {
    const testStudent = new Student();
    testStudent.displayName = 'Test User';
    testStudent.firstName = 'Test';
    testStudent.lastName = 'User';
    testStudent.studentNumber = '1234';

    component.filteredOptions = [testStudent];
    const displayName = component.displayFn(testStudent);
    expect(displayName).toBe('User, Test (1234)');
  });

  it('should populate the initial value when provided', () => {
    component.ngAfterContentInit();
    component.writeValue('1234');

    expect(component.formGroup.controls['studentAutocomplete'].value.studentNumber).toBe('1234');
  });

  it('should know when internalField is invalid', () => {
    component.formGroup.controls['studentAutocomplete'].patchValue(new Student());

    expect(component.formGroup.controls['studentAutocomplete'].valid).toBeTruthy();
  });

  it('should know when internalField is valid', () => {
    component.formGroup.controls['studentAutocomplete'].patchValue('User');
    expect(component.formGroup.controls['studentAutocomplete'].invalid).toBeTruthy();
  });

  it('should autocomplete', fakeAsync(() => {
    component.formGroup.controls['studentAutocomplete'].patchValue('User');

    tick(400); // Need to tick for longer than the debounceTime
    fixture.detectChanges();

    expect(component.filteredOptions.length).toBe(1);
    const testStudent = new Student();
    testStudent.displayName = 'Test User';
    testStudent.firstName = 'Test';
    testStudent.lastName = 'User';
    testStudent.studentNumber = '1234';
    expect(component.filteredOptions).toEqual([testStudent]);
  }));
});
