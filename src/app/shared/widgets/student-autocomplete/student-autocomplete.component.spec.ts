import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { StudentAutocompleteComponent } from './student-autocomplete.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of } from 'rxjs';
import { StudentService } from '../../providers/student.service';
import { StudentSearchResults } from '../../shared/model/student-search-results';
import { A11yModule } from '@angular/cdk/a11y';
import { Student } from '../../shared/model/student';

const testStudent = new Student();
testStudent.displayName = 'Test User';
testStudent.firstName = 'Test';
testStudent.lastName = 'User';
testStudent.studentNumber = '1234';

const studentSearchResults = new StudentSearchResults();
studentSearchResults.totalElements = 1;
studentSearchResults.numberOfElements = 1;
studentSearchResults.content = [testStudent];

describe('StudentAutocompleteComponent', () => {
  let component: StudentAutocompleteComponent;
  let fixture: ComponentFixture<StudentAutocompleteComponent>;
  let studentServiceSpy: StudentService;

  beforeEach(async(() => {
    studentServiceSpy = jasmine.createSpyObj('StudentService', ['read', 'autocomplete']);
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatAutocompleteModule, A11yModule, MatProgressSpinnerModule],
      declarations: [StudentAutocompleteComponent],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy }
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    (<any>studentServiceSpy.read).and.returnValue(of(testStudent));
    (<any>studentServiceSpy.autocomplete).and.returnValue(of(studentSearchResults));

    fixture = TestBed.createComponent(StudentAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // See: https://jira.cac.washington.edu/browse/CAB-4070
  it('should not call student service if control is initialized with empty string', fakeAsync(() => {
    fixture = TestBed.createComponent(StudentAutocompleteComponent);
    fixture.componentInstance.ngControl = <any> new FormControl('');
    fixture.detectChanges();

    tick(1000);

    expect(studentServiceSpy.read).not.toHaveBeenCalled();
  }));

  it('should display a student name', () => {
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
    expect(component.filteredOptions).toEqual([testStudent]);
  }));
});
