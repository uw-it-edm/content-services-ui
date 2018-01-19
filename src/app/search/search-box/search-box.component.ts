import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Observable } from 'rxjs/Observable';
import { SearchFilter } from '../shared/model/search-filter';
import { Subject } from 'rxjs/Subject';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { SearchAutocomplete } from '../shared/search-autocomplete/search-autocomplete';
import { SearchFilterableResult } from '../../shared/shared/model/search-filterable-result';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  searchModel: SearchModel = new SearchModel();

  @Input() searchAutocomplete: SearchAutocomplete;
  @Input() searchModel$: Observable<SearchModel>;
  @Input() pageConfig: SearchPageConfig;
  @Output() searchEvent = new EventEmitter<SearchModel>();

  filteredOptions: SearchFilterableResult[] = [];

  constructor() {}

  ngOnInit() {
    if (this.searchAutocomplete) {
      this.assignAutocompleteListener();
    }
    this.searchModel$.takeUntil(this.componentDestroyed).subscribe(searchModel => {
      this.searchModel = searchModel;
    });
  }

  removeFilter(filter: SearchFilter) {
    console.log('removing filter for ' + filter.key);
    this.searchModel.removeFilter(filter);
    this.updateSearch();
  }

  updateSearch() {
    console.log('search in component with ' + JSON.stringify(this.searchModel));
    this.searchEvent.emit(this.searchModel);
  }

  private assignAutocompleteListener() {
    this.searchEvent.takeUntil(this.componentDestroyed).subscribe((model: SearchModel) => {
      if (model && model.stringQuery && model.stringQuery.trim().length > 1) {
        this.searchAutocomplete
          .autocomplete(model.stringQuery)
          .takeUntil(this.componentDestroyed)
          .subscribe((results: SearchFilterableResult[]) => {
            this.filteredOptions = results;
          });
      } else {
        this.filteredOptions = [];
      }
    });
  }

  onSelectFilter(event: MatAutocompleteSelectedEvent) {
    console.log('select ' + event.option.value);

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
