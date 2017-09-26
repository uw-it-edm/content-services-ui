import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsComponent } from './search-results.component';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { SearchModel } from '../shared/model/search-model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PageConfig } from '../../core/shared/model/page-config';
import { SearchResults } from '../shared/model/search-result';

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [MaterialConfigModule, NoopAnimationsModule, RouterModule],
        declarations: [SearchResultsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    component.searchModel$ = Observable.of(searchModel);
    component.pageConfig = new PageConfig();
    const searchResults = new SearchResults();
    component.searchResults$ = Observable.of(searchResults);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
