import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Observable, Subject } from 'rxjs';
import { SearchFilter } from '../shared/model/search-filter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SearchAutocomplete } from '../shared/search-autocomplete/search-autocomplete';
import { SearchFilterableResult } from '../../shared/shared/model/search-filterable-result';
import { debounceTime, delay, takeUntil } from 'rxjs/operators';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css'],
})
export class SearchBoxComponent implements OnDestroy, OnInit {
  private componentDestroyed = new Subject();
  searchModel: SearchModel = new SearchModel();

  internalSearchField: string;

  @Input()
  readonly: false;
  @Input()
  searchAutocomplete: SearchAutocomplete;
  @Input()
  searchModel$: Observable<SearchModel>;
  @Input()
  pageConfig: SearchPageConfig;
  @Output()
  searchEvent = new EventEmitter<SearchModel>();

  searchBoxEvent = new EventEmitter<string>();

  filteredOptions: SearchFilterableResult[] = [];

  constructor(private liveAnnouncer: LiveAnnouncer) {}

  ngOnInit() {
    if (this.searchAutocomplete) {
      this.assignAutocompleteListener();
    }
    // delay 0 to prevent "Expression has changed after it was checked" when initial search is performed afterViewInit in parent
    this.searchModel$.pipe(delay(0), takeUntil(this.componentDestroyed)).subscribe((searchModel) => {
      console.log('search-box search model updated : ' + this.searchModel.stringQuery);
      this.searchModel = searchModel;
      this.internalSearchField = this.searchModel.stringQuery;
    });
  }

  removeFilter(filter: SearchFilter) {
    if (!this.readonly) {
      console.log('removing filter for ' + filter.key);
      this.searchModel.removeFilter(filter);
      this.announceFilterRemoval(filter);
      this.executeSearch();
    }
  }

  private announceFilterRemoval(searchFilter: SearchFilter) {
    this.liveAnnouncer.announce('Removed ' + searchFilter.getDisplayValue() + ' filter', 'assertive');
  }

  private announceFilterSelection(searchFilter: SearchFilter) {
    this.liveAnnouncer.announce('Selected ' + searchFilter.getDisplayValue() + ' filter', 'assertive');
  }

  clearSearchBox() {
    this.internalSearchField = '';

    this.announceSearchBoxCleared();

    this.executeSearch();
  }

  private announceSearchBoxCleared() {
    const announcementMessage = 'Cleared search text';
    console.log('liveAnnouncer : ' + announcementMessage);
    this.liveAnnouncer.announce(announcementMessage, 'polite');
  }

  executeSearch() {
    this.searchModel.stringQuery = this.internalSearchField;

    this.searchModel.pagination.reset();

    this.searchEvent.emit(this.searchModel);
  }

  searchBoxUpdated() {
    /**
     * ignore when it's a filter selection
     */
    if (typeof this.internalSearchField === 'string') {
      this.searchBoxEvent.emit(this.internalSearchField);
    }
  }

  private assignAutocompleteListener() {
    this.searchBoxEvent.pipe(debounceTime(300), takeUntil(this.componentDestroyed)).subscribe((model: string) => {
      if (model) {
        this.searchAutocomplete
          .autocomplete(model)
          .pipe(takeUntil(this.componentDestroyed))
          .subscribe((results: SearchFilterableResult[]) => {
            this.filteredOptions = results;
            this.announceAutocompleteSearchResults();
          });
      } else {
        this.filteredOptions = [];
      }
    });
  }

  private announceAutocompleteSearchResults() {
    let announcementMessage;

    if (!this.filteredOptions || this.filteredOptions.length === 0) {
      announcementMessage = 'No results for autocomplete';
    } else if (this.filteredOptions.length === 1) {
      announcementMessage = 'Found 1 result : ' + this.filteredOptions[0].getFilterableDisplay();
    } else if (this.filteredOptions.length > 1) {
      announcementMessage = 'Found ' + this.filteredOptions.length + ' results';
    }

    console.log('liveAnnouncer : ' + announcementMessage);

    this.liveAnnouncer.announce(announcementMessage, 'polite');
  }

  onSelectFilter(event: MatAutocompleteSelectedEvent) {
    this.internalSearchField = '';
    this.filteredOptions = [];

    const searchFilter = this.searchAutocomplete.createFilter(event.option.value);
    console.log('adding new filter : ' + JSON.stringify(searchFilter));
    this.searchModel.addFilterIfNotThere(searchFilter);
    this.announceFilterSelection(searchFilter);
    this.executeSearch();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
