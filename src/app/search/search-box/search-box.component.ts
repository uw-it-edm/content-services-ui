import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Observable, Subject } from 'rxjs';
import { SearchFilter } from '../shared/model/search-filter';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { SearchAutocomplete } from '../shared/search-autocomplete/search-autocomplete';
import { SearchFilterableResult } from '../../shared/shared/model/search-filterable-result';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
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

  constructor() {}

  ngOnInit() {
    if (this.searchAutocomplete) {
      this.assignAutocompleteListener();
    }
    this.searchModel$.pipe(takeUntil(this.componentDestroyed)).subscribe(searchModel => {
      console.log('search-box search model updated : ' + this.searchModel.stringQuery);
      this.searchModel = searchModel;
      this.internalSearchField = this.searchModel.stringQuery;
    });
  }

  removeFilter(filter: SearchFilter) {
    if (!this.readonly) {
      console.log('removing filter for ' + filter.key);
      this.searchModel.removeFilter(filter);
      this.executeSearch();
    }
  }

  executeSearch() {
    this.searchModel.stringQuery = this.internalSearchField;

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
    this.searchBoxEvent.pipe(takeUntil(this.componentDestroyed)).subscribe((model: string) => {
      if (model) {
        console.log('Received new search Box event ' + model);
        this.searchAutocomplete
          .autocomplete(model)
          .pipe(takeUntil(this.componentDestroyed))
          .subscribe((results: SearchFilterableResult[]) => {
            this.filteredOptions = results;
          });
      } else {
        this.filteredOptions = [];
      }
    });
  }

  onSelectFilter(event: MatAutocompleteSelectedEvent) {
    this.internalSearchField = '';
    this.filteredOptions = [];

    const searchFilter = this.searchAutocomplete.createFilter(event.option.value);
    console.log('adding new filter : ' + JSON.stringify(searchFilter));
    this.searchModel.addFilterIfNotThere(searchFilter);
    this.executeSearch();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
