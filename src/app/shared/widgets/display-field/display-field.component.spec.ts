import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayFieldComponent } from './display-field.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

describe('DisplayFieldComponent', () => {
  let component: DisplayFieldComponent;
  let fixture: ComponentFixture<DisplayFieldComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [DisplayFieldComponent],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

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
    component.field = { name: 'displayDate', label: 'displayDate', displayType: 'date' };

    fixture.detectChanges();

    const span = fixture.debugElement.query(By.css('span span'));
    const el = span.nativeElement;

    expect(el.innerHTML.trim()).toBe('11/21/2017');
  });
  it('should display a dateTime', () => {
    const date = new Date();

    component.value = date.getTime();
    component.field = { name: 'displayDate', label: 'displayDate', displayType: 'dateTime' };

    fixture.detectChanges();

    const span = fixture.debugElement.query(By.css('span span'));
    const el = span.nativeElement;

    const datePipe = new DatePipe('en');
    const dateTimeString: string = datePipe.transform(date, 'short');
    expect(el.innerHTML.trim()).toBe(dateTimeString);
  });
  it('should use the student-display componenent when a student', () => {
    component.value = '1234';
    component.field = { name: 'displayDate', label: 'displayDate', displayType: 'student' };

    fixture.detectChanges();

    const el = fixture.debugElement.query(By.css('app-student-display'));
    expect(el).not.toBeNull();
    expect(el.nativeElement.value).toContain('1234');
  });
  it('should default to displaying the passed in value', () => {
    component.value = 1511292577000;
    component.field = { name: 'displayDate', label: 'displayDate', displayType: 'aFakeType' };

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
});
