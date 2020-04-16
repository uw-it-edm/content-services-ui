import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NotificationOptions, NotificationService } from '../../providers/notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { PersonService } from '../../providers/person.service';
import { Person } from '../../shared/model/person';
import { PersonDisplayComponent } from './person-display.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class NoopNotificationService extends NotificationService {
  constructor() {
    super(null);
  }

  error(message: string, detailedMessage?: any, options: NotificationOptions = new NotificationOptions()) {}

  info(message: string, detailedMessage?: any, options: NotificationOptions = new NotificationOptions(2000)) {}

  warn(message: string, detailedMessage?: any, options: NotificationOptions = new NotificationOptions()) {}
}

class MockPersonService extends PersonService {
  constructor() {
    super(null, null);
  }

  read(regId: string) {
    if (regId === 'ABCD') {
      const testPerson = new Person();
      testPerson.displayName = 'Test User';
      testPerson.registeredFirstName = 'Test';
      testPerson.registeredLastName = 'User';
      testPerson.regId = 'ABCD';
      testPerson.priorRegIds = ['CDEF', 'GHIJ'];
      testPerson.employeeId = '12345';
      return of(testPerson);
    } else {
      return throwError({ message: 'error' });
    }
  }
}

describe('PersonDisplayComponent', () => {
  let component: PersonDisplayComponent;
  let fixture: ComponentFixture<PersonDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
      declarations: [PersonDisplayComponent],
      providers: [
        { provide: NotificationService, useValue: new NoopNotificationService() },
        { provide: PersonService, useValue: new MockPersonService() },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should look up a regId', () => {
    component.value = 'ABCD';
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.displayName).toBe('User, Test (12345)');

    const el = fixture.debugElement.query(By.css('span'));
    expect(el.nativeElement.innerHTML).toBe('User, Test (12345)');
    expect(el.nativeElement.classList).not.toContain('invalid-regid');
  });
  it('should display the value, and add the "invalid-regid" class if it is not valid', () => {
    component.value = 'AKDSAKD';
    component.ngOnInit();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.displayName).toBe('AKDSAKD');

      const el = fixture.debugElement.query(By.css('span'));
      expect(el.nativeElement.innerHTML).toBe('AKDSAKD');
      expect(el.nativeElement.classList).toContain('invalid-regid');
    });
  });
});
