import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TimestampPickerComponent } from './timestamp-picker.component';
import { SharedModule } from '../../shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import * as moment from 'moment-timezone';

describe('TimestampPickerComponent', () => {
  let component: TimestampPickerComponent;
  let fixture: ComponentFixture<TimestampPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: []
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimestampPickerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the initial value', () => {
    spyOn(component, 'propagateChange').and.callThrough();
    component.writeValue(1511292577000);

    expect(component.propagateChange).toHaveBeenCalledWith(1511292577000);
  });

  it('should have the correct display when input is timestamp with an old date', () => {
    component.writeValue(-57600000);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    const el = input.nativeElement;

    expect(el.value).toBe('12/31/1969');
  });

  it('should have the correct display when input is timestamp', () => {
    component.writeValue(1511292577000);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    const el = input.nativeElement;

    expect(el.value).toBe('11/21/2017');
  });

  it('should send the correct timestamp to input', () => {
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    const el = input.nativeElement;

    spyOn(component, 'propagateChange').and.callThrough();
    el.value = '11/21/2016';
    el.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    expect(el.value).toBe('11/21/2016');

    expect(component.propagateChange).toHaveBeenCalledWith(
      moment.tz('2016-11-21 00:00', 'America/Los_Angeles').valueOf()
    );
  });
});
