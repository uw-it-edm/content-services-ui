import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAutocompleteComponent } from './student-autocomplete.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { Observable } from 'rxjs/Observable';
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
    return Observable.of(testStudent);
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
    return Observable.of(studentSearchResults);
  }
}

describe('StudentAutocompleteComponent', () => {
  let component: StudentAutocompleteComponent;
  let fixture: ComponentFixture<StudentAutocompleteComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, MatAutocompleteModule, A11yModule],
        declarations: [StudentAutocompleteComponent],
        providers: [{ provide: StudentService, useValue: new MockStudentService() }]
      }).compileComponents();
    })
  );

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
    const displayName = component.displayFn('1234');
    expect(displayName).toBe('User, Test (1234)');
  });

  it('should populate the initial value when provided', () => {
    component.ngAfterContentInit();
    component.writeValue('1234');

    expect(component.formGroup.controls['studentAutocomplete'].value).toBe('1234');
  });

  it('should autocomplete', () => {
    component.formGroup.controls['studentAutocomplete'].patchValue('User');
    fixture.detectChanges();

    expect(component.filteredOptions.length).toBe(1);
    const testStudent = new Student();
    testStudent.displayName = 'Test User';
    testStudent.firstName = 'Test';
    testStudent.lastName = 'User';
    testStudent.studentNumber = '1234';
    expect(component.filteredOptions).toEqual([testStudent]);
  });
});
