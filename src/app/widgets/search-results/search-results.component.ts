import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SearchModel } from '../../model/search-model';
import { SearchResults } from '../../model/search-result';
import { PageConfig } from '../../model/page-config';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit,OnDestroy {
  ngOnDestroy(): void {
    console.log('destroy search component');
  }

  searchModel: SearchModel= new SearchModel();

  @Input() searchModel$: Observable<SearchModel>;
  @Input() searchResults: SearchResults;
  @Input() pageConfig: PageConfig;
  @Output() onSearch = new EventEmitter<SearchModel>();


  ngOnInit(): void {
    this.searchModel$.subscribe(searchModel => {
      this.searchModel = searchModel;
    });
  }




}
