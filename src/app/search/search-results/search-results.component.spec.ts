import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SearchResultsComponent } from './search-results.component';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { SearchModel } from '../shared/model/search-model';
import { Field } from '../../core/shared/model/field';
import { of, Subject } from 'rxjs';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { SearchResults } from '../shared/model/search-result';
import { DataService } from '../../shared/providers/data.service';
import { SharedModule } from '../../shared/shared.module';
import { Sort } from '../shared/model/sort';
import { ActivatedRouteStub } from '../../../testing/router-stubs';

class MockDataService {
  storage = ['123', '456'];
}

class RouterStub {
  navigate(url: string) {
    return url;
  }
}

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let dataService: DataService;
  let fixture: ComponentFixture<SearchResultsComponent>;

  beforeEach(() => {
    dataService = new DataService();
    dataService.set('adjacentIds', ['123', '456']);
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialConfigModule, NoopAnimationsModule, RouterModule, SharedModule],
      providers: [
        { provide: DataService, useValue: dataService },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        {
          provide: Router,
          useClass: RouterStub
        }
      ],
      declarations: [SearchResultsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';

    const field = new Field();
    field.key = 'MyFieldKey';
    field.label = 'Friendly Field Name';

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    component.searchModel$ = of(searchModel);
    component.pageConfig = new SearchPageConfig();
    component.pageConfig.defaultSort = new Sort('myfield', 'asc');
    component.pageConfig.fieldKeysToDisplay.push(field.key);
    component.pageConfig.fieldsToDisplay.push(field);
    component.searchResults$ = new Subject<SearchResults>();
    component.searchResults$.next(new SearchResults());

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set sort order if defaultSort is defined in the pageConfig', () => {
    component.searchResults$.next(new SearchResults());
    fixture.detectChanges();
    expect(component.sortTerm).toBe('myfield');
    expect(component.sortDirection).toBe('asc');
    // This verifies that the change is being passed successfully through the databinding and that the
    // event on the matSort object is being digested correctly
    expect(component.sort.active).toBe('myfield');
    expect(component.sort.direction).toBe('asc');
  });

  it('should change sort order when a new sort is defined in the search results', () => {
    const sort = new Sort('newfield', 'desc');
    component.searchResults$.next(new SearchResults(sort));
    fixture.detectChanges();
    // This verifies that the variables are being directly set in the subscription method
    expect(component.sortTerm).toBe('newfield');
    expect(component.sortDirection).toBe('desc');
    // This verifies that the change is being passed successfully through the databinding and that the
    // event on the matSort object is being digested correctly
    expect(component.sort.active).toBe('newfield');
    expect(component.sort.direction).toBe('desc');
  });

  it('should use the field label for the aria attribute of sorting button', () => {
    const headerButtons = fixture.debugElement.queryAll(By.css('.mat-sort-header-button'));
    expect(headerButtons.length).toBe(2);

    const secondHeaderButton: HTMLElement = headerButtons[1].nativeElement;
    expect(secondHeaderButton.getAttribute('aria-label')).toEqual('Change sorting for Friendly Field Name');
  });
});
