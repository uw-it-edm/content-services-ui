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
import { DataApiValueDisplayComponent } from '../../shared/widgets/data-api-display/data-api-value-display.component';
import { FacetConfig } from '../../core/shared/model/facet-config';
import { DataApiValueService } from '../../shared/providers/dataapivalue.service';
import { NotificationService } from '../../shared/providers/notification.service';
import { NO_ERRORS_SCHEMA, QueryList } from '@angular/core';
import { SearchPagination } from '../shared/model/search-pagination';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockConfigResolver extends ConfigResolver {
  constructor() {
    super(null, null, null);
  }

  getCustomTextSubject(): Observable<Map<string, CustomTextItem>> {
    return of(new Map());
  }
}

class MockDataApiValueService extends DataApiValueService {
  constructor() {
    super(null, null);
  }
}

class MockNotificationService extends NotificationService {
  constructor() {
    super(null);
  }
}

describe('FacetsBoxComponent', () => {
  let component: FacetsBoxComponent;
  let fixture: ComponentFixture<FacetsBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MaterialConfigModule, RouterModule, NoopAnimationsModule],
      declarations: [FacetsBoxComponent, DataApiValueDisplayComponent],
      providers: [
        { provide: ConfigResolver, useValue: new MockConfigResolver() },
        { provide: DataApiValueService, useValue: new MockDataApiValueService() },
        { provide: NotificationService, useValue: new MockNotificationService() }
      ],
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

    // create a DataApiDisplayComponen instance
    const dataApiDisplayComponentFixture = TestBed.createComponent(DataApiValueDisplayComponent);
    const dataApiDisplayComponent = dataApiDisplayComponentFixture.componentInstance;
    dataApiDisplayComponent.value = 'testValue';
    dataApiDisplayComponent.type = 'my-type';
    dataApiDisplayComponent.labelPath = 'label';
    dataApiDisplayComponent.displayValue = 'displayValue';
    component.dataApiDisplayComponents = new QueryList();
    component.dataApiDisplayComponents.reset([dataApiDisplayComponent]);
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

  it('should use display value', () => {
    const facetConfig = new FacetConfig();
    facetConfig.key = 'testKey';
    facetConfig.label = 'testLabel';
    facetConfig.dataApiValueType = 'my-type';
    facetConfig.dataApiLabelPath = 'label';

    const searchFilter = new SearchFilter('testKey', 'testValue', 'testLabel', 'displayValue');
    component.addFacetFilter(facetConfig.key, 'testValue', facetConfig.label, facetConfig);
    expect(component.searchModel.filters.length).toEqual(1);
    expect(component.searchModel.filters).toEqual([searchFilter]);
  });

  it('should reset pagination while keeping pageSize', () => {
    const searchPagination = new SearchPagination();
    searchPagination.pageSize = 123;
    searchPagination.pageIndex = 2;
    component.searchModel.pagination = searchPagination;

    const searchFilter = new SearchFilter('testKey', 'testString', 'testLabel');
    component.addFacetFilter(searchFilter.key, searchFilter.value, searchFilter.label);

    expect(component.searchModel.pagination.pageSize).toEqual(123);
    expect(component.searchModel.pagination.pageIndex).toEqual(0);
  });
});
