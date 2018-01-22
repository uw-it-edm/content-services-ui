import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Observable } from 'rxjs/Observable';
import { SearchResults } from '../shared/model/search-result';
import { SearchFilter } from '../shared/model/search-filter';
import { Subject } from 'rxjs/Subject';
import { isUndefined } from 'util';

@Component({
  selector: 'app-facets-box',
  templateUrl: './facets-box.component.html',
  styleUrls: ['./facets-box.component.css']
})
export class FacetsBoxComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  searchModel: SearchModel = new SearchModel();

  private selectedFacets: string[] = [];

  @Input() searchModel$: Observable<SearchModel>;
  @Input() searchResults$: Observable<SearchResults>;
  @Input() pageConfig: SearchPageConfig;
  @Output() facetFilterAdded = new EventEmitter<SearchModel>();

  searchResults: SearchResults;

  constructor() {}

  ngOnInit() {
    this.searchModel$.takeUntil(this.componentDestroyed).subscribe(searchModel => {
      this.searchModel = searchModel;
    });
    this.searchResults$.takeUntil(this.componentDestroyed).subscribe(searchResults => {
      this.searchResults = searchResults;

      // only update the selected facets after search results are updated
      // to avoid flickering effect on the links

      this.selectedFacets = this.getSelectedFacetKeys();
    });
  }

  private getSelectedFacetKeys() {
    return this.searchModel.filters.map(filter => filter.key);
  }

  hasSelectedFacet(key: string) {
    return !isUndefined(this.selectedFacets.find(selectedFacet => selectedFacet === key));
  }
  getFacetsConfig() {
    return Object.keys(this.pageConfig.facetsConfig.facets).map(key => {
      return this.pageConfig.facetsConfig.facets[key];
    });
  }

  addFacetFilter(key: string, value: string, label: string) {
    const searchFilter = new SearchFilter(key, value, label);
    console.log('adding new facet : ' + JSON.stringify(searchFilter));

    this.searchModel.addFilterIfNotThere(searchFilter);

    this.facetFilterAdded.emit(this.searchModel);
  }

  select(event) {
    alert(JSON.stringify(event));
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
