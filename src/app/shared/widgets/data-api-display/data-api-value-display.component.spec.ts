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

describe('DataApiValueDisplayComponent', () => {
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
  });

  it('should look up a dataApiValue', () => {
    fixture.detectChanges();

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
    fixture.detectChanges();

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

  describe('with source model', () => {
    it('should use display value from source model', () => {
      component.value = 'val1';
      component.sourceModel = { valueId: 'val1', type: null, data: { label: 'value 1' } };
      fixture.detectChanges();

      expect(component.displayValue).toEqual('value 1');

      const el = fixture.debugElement.query(By.css('span'));
      expect(el.nativeElement.innerHTML).toBe('value 1');
      expect(el.nativeElement.classList).not.toContain('invalid-regid');
    });

    it('should use display value from source model with custom label path', () => {
      component.value = 'val1';
      component.labelPath = 'prop.label';
      component.sourceModel = {
        valueId: 'val1',
        type: null,
        data: {
          prop: {
            label: 'value 1',
          },
        },
      };
      fixture.detectChanges();

      expect(component.displayValue).toEqual('value 1');
      expect(component.invalidValueId).toBeFalse();
    });

    it('should use raw value in error mode if source model is missing label', () => {
      component.value = 'val1';
      component.sourceModel = { valueId: 'val1', type: null, data: { badLabel: 'value 1' } };
      fixture.detectChanges();

      expect(component.displayValue).toBe('val1');
      expect(component.invalidValueId).toBeTrue();
    });
  });
});
