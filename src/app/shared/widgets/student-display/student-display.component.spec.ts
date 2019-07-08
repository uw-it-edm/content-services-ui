import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDisplayComponent } from './student-display.component';
import { StudentService } from '../../providers/student.service';
import { Student } from '../../shared/model/student';
import { By } from '@angular/platform-browser';
import { NotificationService } from '../../providers/notification.service';
import { MatSnackBarModule } from '@angular/material';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
}

describe('StudentDisplayComponent', () => {
  let component: StudentDisplayComponent;
  let fixture: ComponentFixture<StudentDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
      declarations: [StudentDisplayComponent],
      providers: [{ provide: StudentService, useValue: new MockStudentService() }, NotificationService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should look up a student id', () => {
    component.value = '1234';
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.displayName).toBe('User, Test (1234)');

    const el = fixture.debugElement.query(By.css('span'));
    expect(el.nativeElement.innerHTML).toBe('User, Test (1234)');
    expect(el.nativeElement.classList).not.toContain('invalid-student-number');
  });
  it('should display the value, and add the "invalid-student-number" class if it is not a number', () => {
    component.value = 'a test';
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.displayName).toBe('a test');

    const el = fixture.debugElement.query(By.css('span'));
    expect(el.nativeElement.innerHTML).toBe('a test');
    expect(el.nativeElement.classList).toContain('invalid-student-number');
  });
});
