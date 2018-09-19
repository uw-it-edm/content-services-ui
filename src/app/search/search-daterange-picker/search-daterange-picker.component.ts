import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Moment } from 'moment';
import { SearchModel } from '../shared/model/search-model';
import { SearchFilter } from '../shared/model/search-filter';
import { SearchDaterangeConfig } from '../../core/shared/model/search-daterange-config';
import { isNullOrUndefined } from '../../core/util/node-utilities';

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
  ranges: any;
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
    this.formGroup = this.fb.group({
      internalDateRange: new FormControl()
    });
    this.searchModel$.takeUntil(this.componentDestroyed).subscribe(searchModel => {
      this.searchModel = searchModel;
    });

    this.formGroup.controls['internalDateRange'].valueChanges
      .startWith(null)
      .takeUntil(this.componentDestroyed)
      .subscribe(selected => {
        if (selected) {
          const startDate: Moment = selected.startDate;
          const endDate: Moment = selected.endDate;
          this.addDateRangeFilter(startDate, endDate);
        }
      });
    this.loadPageConfig();
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
      const value = '[' + startDate.toISOString() + ' TO ' + endDate.toISOString() + ']';
      const searchFilter = new SearchFilter(key, value, label);
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
