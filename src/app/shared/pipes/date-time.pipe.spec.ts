import { DateTimePipe } from './date-time.pipe';
import { async, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';

describe('DateTimePipe', () => {
  let pipe: DateTimePipe;
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({}).compileComponents();
    })
  );
  beforeEach(() => {
    pipe = new DateTimePipe(new DatePipe('en'));
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms to date', () => {
    expect(pipe.transform(1511222876000, 'date')).toEqual('11/20/2017');
  });
  it('transforms to dateTime', () => {
    expect(pipe.transform(1511222876000, 'dateTime')).toEqual('11/20/2017, 4:07 PM');
  });
  it('defaults to dateTime', () => {
    expect(pipe.transform(1511222876000, 'invalidParameter')).toEqual('11/20/2017, 4:07 PM');
  });
});
