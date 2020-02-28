import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayFieldComponent } from './display-field.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Field } from '../../../core/shared/model/field';
import { SafeCurrencyPipe } from '../../../shared/pipes/safe-currency.pipe';

describe('DisplayFieldComponent', () => {
  let component: DisplayFieldComponent;
  let fixture: ComponentFixture<DisplayFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayFieldComponent, SafeCurrencyPipe],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a date', () => {
    component.value = 1511292577000;
    component.field = Object.assign(new Field(), { key: 'displayDate', label: 'displayDate', displayType: 'date' });

    fixture.detectChanges();

    const span = fixture.debugElement.query(By.css('span span'));
    const el = span.nativeElement;

    expect(el.innerHTML.trim()).toBe('11/21/2017');
  });

  it('should display a dateTime', () => {
    const date = new Date('1995-12-17T03:24:00');

    component.value = date.getTime();
    component.field = Object.assign(new Field(), { key: 'displayDate', label: 'displayDate', displayType: 'dateTime' });

    fixture.detectChanges();

    const span = fixture.debugElement.query(By.css('span span'));
    const el = span.nativeElement;

    expect(el.innerHTML.trim()).toBe('12/17/1995, 3:24 AM');
  });

  it('should use the student-display componenent when a student', () => {
    component.value = '1234';
    component.field = Object.assign(new Field(), { key: 'displayDate', label: 'displayDate', displayType: 'student' });

    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('app-student-display'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.value).toContain('1234');
  });

  it('should default to displaying the passed in value', () => {
    component.value = 1511292577000;
    component.field = Object.assign(new Field(), {
      key: 'displayDate',
      label: 'displayDate',
      displayType: 'aFakeType'
    });

    fixture.detectChanges();

    const span = fixture.debugElement.query(By.css('span span'));
    const el = span.nativeElement;

    expect(el.innerHTML.trim()).toBe('1511292577000');
  });

  it('should not display anything if the field is not provided', () => {
    component.value = 1511292577000;

    fixture.detectChanges();

    const span = fixture.debugElement.query(By.all());

    expect(span).toBeNull();
  });

  describe('for currency field', () => {
    const testCurrencyField = (componentValue: any, expectedString: string) => {
      component.value = componentValue;
      component.field = Object.assign(new Field(), {
        key: 'testValue',
        label: 'testValue',
        dataType: 'number',
        displayType: 'currency'
      });

      fixture.detectChanges();

      const span = fixture.debugElement.query(By.css('span span'));
      const el = span.nativeElement;

      expect(el.innerHTML.trim()).toBe(expectedString);
    };

    it('should display text as currency', () => {
      testCurrencyField('12', '$12.00');
    });

    it('should display large number as currency with two decimals', () => {
      testCurrencyField(123456789.123456789, '$123,456,789.12');
    });

    it('should display textual zero as currency', () => {
      testCurrencyField('0', '$0.00');
    });

    it('should display textual negative number as currency', () => {
      testCurrencyField('-100.99', '-$100.99');
    });

    it('should display empty string and null as empty', () => {
      testCurrencyField('', '');
      testCurrencyField(null, '');
    });

    it('should display text value if cannot be converted to currency', () => {
      testCurrencyField('invalidNumber', 'invalidNumber');
    });
  });
});
