import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchModel } from '../../model/search-model';
import { PageConfig } from '../../model/page-config';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css']
})
export class SearchBoxComponent implements OnInit {

  searchModel: SearchModel= new SearchModel();

  @Input() searchModel$: Observable<SearchModel>;
  @Input() pageConfig: PageConfig;
  @Output() search = new EventEmitter<SearchModel>();

  constructor() { }

  ngOnInit() {
    this.searchModel$.subscribe(searchModel => {
      this.searchModel = searchModel;
    });
  }

  updateSearch() {
    console.log('search in component with ' + JSON.stringify(this.searchModel));
    this.search.emit(this.searchModel);
  }
}
