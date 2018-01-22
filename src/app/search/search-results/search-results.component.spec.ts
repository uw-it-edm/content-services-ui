import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsComponent } from './search-results.component';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { SearchModel } from '../shared/model/search-model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { SearchResults } from '../shared/model/search-result';
import { DataService } from '../../shared/providers/data.service';
import { SharedModule } from '../../shared/shared.module';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { SearchOrder } from '../shared/model/search-order';

class MockDataService {
  storage = ['123', '456'];
}

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let dataService: DataService;
  let fixture: ComponentFixture<SearchResultsComponent>;

  beforeEach(() => {
    dataService = new DataService();
    dataService.set('adjacentIds', ['123', '456']);
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [MaterialConfigModule, NoopAnimationsModule, RouterModule, SharedModule],
        providers: [{ provide: DataService, useValue: dataService }],
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
    component.pageConfig = new SearchPageConfig();
    component.pageConfig.defaultOrder = new SearchOrder('myfield', 'asc');
    const searchResults = new SearchResults();
    component.searchResults$ = Observable.of(searchResults);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set sort order if defaultOrder is defined in the pageConfig', () => {
    expect(component.sort.active).toBe('myfield');
    expect(component.sort.direction).toBe('asc');
  });
});
