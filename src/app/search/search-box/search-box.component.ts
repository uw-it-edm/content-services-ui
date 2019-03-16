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
    });
  }

  removeFilter(filter: SearchFilter) {
    if (!this.readonly) {
      console.log('removing filter for ' + filter.key);
      this.searchModel.removeFilter(filter);
      this.updateSearch();
    }
  }

  updateSearch() {
    console.log('search in component with ' + JSON.stringify(this.searchModel));
    this.searchEvent.emit(this.searchModel);
  }

  searchBoxChanged() {
    this.searchBoxEvent.emit(this.searchModel.stringQuery);
  }

  private assignAutocompleteListener() {
    this.searchBoxEvent.pipe(takeUntil(this.componentDestroyed)).subscribe((model: string) => {
      if (model) {
        console.log('model update ' + model);
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
    console.log('select ' + event.option.value.value);

    const searchFilter = this.searchAutocomplete.createFilter(event.option.value);
    console.log('adding new filter : ' + JSON.stringify(searchFilter));

    this.searchModel.addFilterIfNotThere(searchFilter);
    this.updateSearch();
    this.searchModel.stringQuery = ''; // clear search field when selecting a filter
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
