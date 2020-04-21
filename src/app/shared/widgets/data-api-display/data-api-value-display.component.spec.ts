import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NotificationOptions, NotificationService } from '../../providers/notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DataApiValueService } from '../../providers/dataapivalue.service';
import { DataApiValue } from '../../shared/model/data-api-value';
import { DataApiValueDisplayComponent } from './data-api-value-display.component';

class NoopNotificationService extends NotificationService {
  constructor() {
    super(null);
  }

  error(message: string, detailedMessage?: any, options: NotificationOptions = new NotificationOptions()) {}

  info(message: string, detailedMessage?: any, options: NotificationOptions = new NotificationOptions(2000)) {}

  warn(message: string, detailedMessage?: any, options: NotificationOptions = new NotificationOptions()) {}
}

class MockDataApiValueService extends DataApiValueService {
  constructor() {
    super(null, null);
  }

  getByTypeAndValueId(type: string, value: string) {
    if (value === 'ABCD' && type === 'my-type') {
      const testDataApiValue = new DataApiValue();
      testDataApiValue.valueId = 'ABCD';
      testDataApiValue.data = { metadata: { label: 'Label of ABCD' } };
      return of(testDataApiValue);
    } else {
      return throwError({ message: 'error' });
    }
  }
}

describe('PersonDisplayComponent', () => {
  let component: DataApiValueDisplayComponent;
  let fixture: ComponentFixture<DataApiValueDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, NoopAnimationsModule],
      declarations: [DataApiValueDisplayComponent],
      providers: [
        { provide: NotificationService, useValue: new NoopNotificationService() },
        { provide: DataApiValueService, useValue: new MockDataApiValueService() },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataApiValueDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should look up a dataApiValue', () => {
    component.value = 'ABCD';
    component.type = 'my-type';
    component.labelPath = 'metadata.label';
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.displayValue).toBe('Label of ABCD');

    const el = fixture.debugElement.query(By.css('span'));
    expect(el.nativeElement.innerHTML).toBe('Label of ABCD');
    expect(el.nativeElement.classList).not.toContain('invalid-regid');
  });
  it('should display the value, and add the "invalid-valueid" class if it is not a valid valueId', () => {
    component.value = 'AKDSAKD';
    component.ngOnInit();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.displayValue).toBe('AKDSAKD');

      const el = fixture.debugElement.query(By.css('span'));
      expect(el.nativeElement.innerHTML).toBe('AKDSAKD');
      expect(el.nativeElement.classList).toContain('invalid-valueid');
    });
  });
});
