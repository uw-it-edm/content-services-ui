import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Moment } from 'moment';
import { SearchModel } from '../shared/model/search-model';
import { SearchFilter } from '../shared/model/search-filter';
import { SearchDaterangeConfig } from '../../core/shared/model/search-daterange-config';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-daterange-picker',
  templateUrl: './search-daterange-picker.component.html',
  styleUrls: ['./search-daterange-picker.component.css'],
  encapsulation: ViewEncapsulation.None
}) // To allow styling of the mat-form-field ViewEncapsulation.None
export class SearchDaterangePickerComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  searchModel: SearchModel = new SearchModel();
  formGroup: FormGroup;
  ranges: any = null;
  showRangeLabelOnInput: boolean;
  showClearButton: boolean;
  showDropdowns: boolean;
  alwaysShowCalendars: boolean;
  placeholder: string;

  @Input()
  searchModel$: Observable<SearchModel>;
  @Input()
  searchDaterangeConfig: SearchDaterangeConfig;
  @Output()
  dateRangeFilterAdded = new EventEmitter<SearchModel>();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formGroup = this.fb.group({});
    this.formGroup.controls['internalDateRange'] = new FormControl();
    this.searchModel$.pipe(takeUntil(this.componentDestroyed)).subscribe(searchModel => {
      this.searchModel = searchModel;
      // TODO: if filter is removed, clear daterange-picker textfield
    });

    this.loadPageConfig();
  }

  datesUpdated(selected) {
    if (
      selected &&
      ((selected.startDate && selected.endDate) ||
        (isNullOrUndefined(selected.startDate) && isNullOrUndefined(selected.endDate)))
    ) {
      const startDate: Moment = this.createLosAngelesMoment(selected.startDate);
      const endDate: Moment = this.createLosAngelesMoment(selected.endDate);
      this.addDateRangeFilter(startDate, endDate);
    }
  }

  private createLosAngelesMoment(aMoment: Moment) {
    return isNullOrUndefined(aMoment) ? null : moment.tz(aMoment.format('YYYY-MM-DD'), 'America/Los_Angeles');
  }

  private loadPageConfig(): void {
    if (this.searchDaterangeConfig.showRelativeRange) {
      this.ranges = {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [
          moment()
            .subtract(1, 'month')
            .startOf('month'),
          moment()
            .subtract(1, 'month')
            .endOf('month')
        ]
      };
    }
    this.alwaysShowCalendars = this.searchDaterangeConfig.showCalendar;
    this.placeholder = this.searchDaterangeConfig.placeholder;
    this.showClearButton = this.searchDaterangeConfig.showClearButton;
    this.showRangeLabelOnInput = this.searchDaterangeConfig.displayRangeLabelInsteadOfDates;
    this.showDropdowns = this.searchDaterangeConfig.showDropdowns;
  }

  private addDateRangeFilter(startDate: Moment, endDate: Moment) {
    const key = this.searchDaterangeConfig.filterKey;
    const label = this.searchDaterangeConfig.filterLabel;

    if (!isNullOrUndefined(startDate) && !isNullOrUndefined(endDate)) {
      // rounding up the range to the day.
      // see https://www.elastic.co/guide/en/elasticsearch/reference/2.4/query-dsl-range-query.html#_date_math_and_rounding
      const value = '[' + startDate.format('YYYY-MM-DD') + '||/d TO ' + endDate.format('YYYY-MM-DD') + '||/d]';
      const displayValue = '[' + startDate.format('YYYY-MM-DD') + ' TO ' + endDate.format('YYYY-MM-DD') + ']';
      const searchFilter = new SearchFilter(key, value, label, displayValue);
      console.log('adding new dateRangeFilter : ' + JSON.stringify(searchFilter));

      this.searchModel.addOrReplaceFilterForKey(searchFilter);
    } else {
      console.log('removing  dateRangeFilter for key: ' + key);
      this.searchModel.removeFilterForKey(key);
    }

    this.dateRangeFilterAdded.emit(this.searchModel);
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
