import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Observable } from 'rxjs/Observable';
import { SearchFilter } from '../shared/model/search-filter';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  searchModel: SearchModel = new SearchModel();

  @Input() searchModel$: Observable<SearchModel>;
  @Input() pageConfig: SearchPageConfig;
  @Output() searchEvent = new EventEmitter<SearchModel>();

  constructor() {}

  ngOnInit() {
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

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
