import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Observable, Subject } from 'rxjs';
import { SearchResults } from '../shared/model/search-result';
import { SearchFilter } from '../shared/model/search-filter';
import { isUndefined } from '../../core/util/node-utilities';
import { takeUntil } from 'rxjs/operators';
import { ConfigResolver } from '../../routing/shared/config-resolver.service';
import { CustomTextItem } from '../../core/shared/model/config';
import { CustomTextUtilities } from '../../shared/directives/custom-text/custom-text-utilities';
import { LiveAnnouncer } from '@angular/cdk/a11y';

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

  customText: Map<string, CustomTextItem>;

  searchResults: SearchResults;

  constructor(private configResolver: ConfigResolver, private liveAnnouncer: LiveAnnouncer) {}

  ngOnInit() {
    this.searchModel$.pipe(takeUntil(this.componentDestroyed)).subscribe(searchModel => {
      this.searchModel = searchModel;
    });
    this.searchResults$.pipe(takeUntil(this.componentDestroyed)).subscribe(searchResults => {
      this.searchResults = searchResults;

      // only update the selected facets after search results are updated
      // to avoid flickering effect on the links

      this.selectedFacets = this.getSelectedFacetKeys();
    });
    this.configResolver
      .getCustomTextSubject()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(customText => {
        this.customText = customText;
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
      if (!this.pageConfig.facetsConfig.facets[key].size) {
        this.pageConfig.facetsConfig.facets[key].size = 5; // default
      }

      if (!this.pageConfig.facetsConfig.facets[key].maxSize) {
        this.pageConfig.facetsConfig.facets[key].maxSize = this.pageConfig.facetsConfig.facets[key].size; // for backward compatibility
      }

      if (!this.pageConfig.facetsConfig.facets[key].cursize) {
        this.pageConfig.facetsConfig.facets[key].cursize = this.pageConfig.facetsConfig.facets[key].size;
      }
      return this.pageConfig.facetsConfig.facets[key];
    });
  }

  addFacetFilter(key: string, value: string, label: string) {
    const customizedText = CustomTextUtilities.getCustomText(this.customText, this.getCustomTextKey(key, value), value);
    let searchFilter;
    if (customizedText.isCustom) {
      searchFilter = new SearchFilter(key, value, label, customizedText.label);
    } else {
      searchFilter = new SearchFilter(key, value, label);
    }

    console.log('adding new facet : ' + JSON.stringify(searchFilter));

    this.searchModel.addFilterIfNotThere(searchFilter);

    this.announceFacetSelection(searchFilter);

    this.facetFilterAdded.emit(this.searchModel);
  }

  private announceFacetSelection(searchFilter: SearchFilter) {
    this.liveAnnouncer.announce('Selected ' + searchFilter.getDisplayValue() + ' filter', 'assertive');
  }

  private getCustomTextKey(key: string, value: string) {
    return 'facet.' + key + '.' + value;
  }

  select(event) {
    alert(JSON.stringify(event));
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
