import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { PageConfig } from '../../core/shared/model/page-config';
import { Observable } from 'rxjs/Observable';
import { SearchResults } from '../shared/model/search-result';
import { SearchFilter } from '../shared/model/search-filter';

@Component({
  selector: 'app-facets-box',
  templateUrl: './facets-box.component.html',
  styleUrls: ['./facets-box.component.css']
})
export class FacetsBoxComponent implements OnInit {
  searchModel: SearchModel = new SearchModel();

  @Input() searchModel$: Observable<SearchModel>;
  @Input() searchResults$: Observable<SearchResults>;
  @Input() pageConfig: PageConfig;
  @Output() facetFilterAdded = new EventEmitter<SearchModel>();

  searchResults: SearchResults;

  constructor() {}

  ngOnInit() {
    this.searchModel$.subscribe(searchModel => {
      this.searchModel = searchModel;
    });
    this.searchResults$.subscribe(searchResults => {
      this.searchResults = searchResults;
    });
  }

  getFacetsConfig() {
    return Object.keys(this.pageConfig.facetsConfig.facets).map(key => {
      return this.pageConfig.facetsConfig.facets[key];
    });
  }

  addFacetFilter(key: string, value: string) {
    const searchFilter = new SearchFilter(key, value);
    console.log('adding new facet : ' + JSON.stringify(searchFilter));

    this.searchModel.filters.push(searchFilter);

    this.facetFilterAdded.emit(this.searchModel);
  }

  select(event) {
    alert(JSON.stringify(event));
  }
}
