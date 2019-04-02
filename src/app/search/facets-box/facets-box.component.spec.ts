import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { SearchModel } from '../shared/model/search-model';

import { FacetsBoxComponent } from './facets-box.component';
import { SearchResults } from '../shared/model/search-result';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { SearchFilter } from '../shared/model/search-filter';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ConfigResolver } from '../../routing/shared/config-resolver.service';
import { CustomTextItem } from '../../core/shared/model/config';
import { NO_ERRORS_SCHEMA } from '@angular/core';

class MockConfigResolver extends ConfigResolver {
  constructor() {
    super(null, null, null);
  }
  getCustomTextSubject(): Observable<Map<string, CustomTextItem>> {
    return of(new Map());
  }
}

describe('FacetsBoxComponent', () => {
  let component: FacetsBoxComponent;
  let fixture: ComponentFixture<FacetsBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MaterialConfigModule, RouterModule],
      declarations: [FacetsBoxComponent],
      providers: [{ provide: ConfigResolver, useValue: new MockConfigResolver() }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetsBoxComponent);
    component = fixture.componentInstance;
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    component.searchModel$ = of(searchModel);
    component.pageConfig = new SearchPageConfig();

    const searchResults = new SearchResults();

    component.searchResults$ = of(searchResults);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized searchModel ', () => {
    expect(component.searchModel.stringQuery).toBe('iSearch');
  });

  it('should add filters to searchModel', () => {
    const searchFilter = new SearchFilter('testKey', 'testString', 'testLabel');
    component.addFacetFilter(searchFilter.key, searchFilter.value, searchFilter.label);
    expect(component.searchModel.filters).toEqual([searchFilter]);
  });
});
