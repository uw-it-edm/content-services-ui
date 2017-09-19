import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SearchModel } from '../shared/model/search-model';
import { SearchResults } from '../shared/model/search-result';
import { PageConfig } from '../../core/shared/model/page-config';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  searchModel: SearchModel = new SearchModel();

  displayedColumns = ['id'];

  @Input() searchModel$: Observable<SearchModel>;
  @Input() searchResults: SearchResults;
  @Input() pageConfig: PageConfig;
  @Output() search = new EventEmitter<SearchModel>();

  ngOnDestroy(): void {
    console.log('destroy search component');
  }

  ngOnInit(): void {
    this.searchModel$.subscribe(searchModel => {
      this.searchModel = searchModel;
    });
  }
}
