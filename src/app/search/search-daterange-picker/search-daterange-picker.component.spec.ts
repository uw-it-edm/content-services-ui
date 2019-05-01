import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SearchDaterangePickerComponent } from './search-daterange-picker.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { SearchModel } from '../shared/model/search-model';
import { SearchDaterangeConfig } from '../../core/shared/model/search-daterange-config';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Moment } from 'moment';
import { SearchFilter } from '../shared/model/search-filter';
import * as moment from 'moment-timezone';
import { of } from 'rxjs';

describe('SearchDaterangePickerComponent', () => {
  let component: SearchDaterangePickerComponent;
  let fixture: ComponentFixture<SearchDaterangePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NgxDaterangepickerMd, MaterialConfigModule, NoopAnimationsModule],
      declarations: [SearchDaterangePickerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDaterangePickerComponent);
    component = fixture.componentInstance;

    const searchDaterangeConfig = new SearchDaterangeConfig();
    searchDaterangeConfig.filterKey = 'testKey';
    searchDaterangeConfig.filterLabel = 'testLabel';
    component.searchDaterangeConfig = searchDaterangeConfig;

    const searchModel = new SearchModel();
    component.searchModel$ = of(searchModel);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add daterange filter if not present', () => {
    const startDate: Moment = moment('01-01-2018', 'MM-DD-YYYY');
    const endDate: Moment = moment('02-01-2018', 'MM-DD-YYYY');

    component.formGroup.controls['internalDateRange'].patchValue({ startDate: startDate, endDate: endDate });
    fixture.detectChanges();

    expect(component.searchModel.filters.length).toBe(1);
    expect(component.searchModel.filters[0].displayValue).toBe('[2018-01-01 TO 2018-02-01]');
    expect(component.searchModel.filters[0].value).toBe('[2018-01-01||/d TO 2018-02-01||/d]');
    expect(component.searchModel.filters[0].key).toBe('testKey');
    expect(component.searchModel.filters[0].label).toBe('testLabel');
  });

  it('should replace existing daterange filter', () => {
    const existingFilter = new SearchFilter('testKey', 'testDateRange', 'testLabel');
    component.searchModel.filters[0] = existingFilter;

    const startDate: Moment = moment('01-01-2018', 'MM-DD-YYYY');
    const endDate: Moment = moment('02-01-2018', 'MM-DD-YYYY');
    component.formGroup.controls['internalDateRange'].patchValue({ startDate: startDate, endDate: endDate });
    fixture.detectChanges();

    expect(component.searchModel.filters.length).toBe(1);
    expect(component.searchModel.filters[0].displayValue).toBe('[2018-01-01 TO 2018-02-01]');
    expect(component.searchModel.filters[0].value).toBe('[2018-01-01||/d TO 2018-02-01||/d]');
    expect(component.searchModel.filters[0].key).toBe('testKey');
    expect(component.searchModel.filters[0].label).toBe('testLabel');
  });

  it('should emit a searchModel', () => {
    component.dateRangeFilterAdded.subscribe((searchModel: SearchModel) => {
      expect(component.searchModel.filters.length).toBe(1);
      expect(component.searchModel.filters[0].displayValue).toBe('[2018-01-01 TO 2018-02-01]');
      expect(component.searchModel.filters[0].value).toBe('[2018-01-01||/d TO 2018-02-01||/d]');
      expect(component.searchModel.filters[0].key).toBe('testKey');
      expect(component.searchModel.filters[0].label).toBe('testLabel');
    });

    const startDate: Moment = moment('01-01-2018', 'MM-DD-YYYY');
    const endDate: Moment = moment('02-01-2018', 'MM-DD-YYYY');

    component.datesUpdated({ startDate: startDate, endDate: endDate });
  });
});
