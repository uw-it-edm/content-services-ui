import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SearchPageComponent } from './search-page.component';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { ActivatedRoute } from '@angular/router';
import { Title, By } from '@angular/platform-browser';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { Config } from '../../core/shared/model/config';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { SearchService } from '../shared/search.service';
import { Observable, of, throwError } from 'rxjs';
import { SearchResults } from '../shared/model/search-result';
import { SearchModel } from '../shared/model/search-model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DataService } from '../../shared/providers/data.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { StudentService } from '../../shared/providers/student.service';
import { NotificationService } from '../../shared/providers/notification.service';
import { PersonService } from '../../shared/providers/person.service';
import { FacetConfig } from '../../core/shared/model/facet-config';
import { FacetsConfig } from '../../core/shared/model/facets-config';
import { ResultRow } from '../shared/model/result-row';
import Spy = jasmine.Spy;

class MockSearchService {
  search(terms: SearchModel, pageConfig: SearchPageConfig): Observable<SearchResults> {
    if (terms.stringQuery === 'ThrowError') {
      return throwError('An Error Occurred');
    }
    return of(new SearchResults());
  }
}

function getTestSearchModel(stringQuery: string): SearchModel {
  const searchModel = new SearchModel();
  searchModel.stringQuery = stringQuery;
  return searchModel;
}

function getFacetsConfig(): FacetsConfig {
  const facetsConfig: FacetsConfig = new FacetsConfig();
  facetsConfig.active = true;
  facetsConfig.facets.set('myFacet', {
    key: 'metadata.mybooleanfield',
    label: 'My boolean',
    order: 'asc',
    size: 3,
    maxSize: 50,
    dataApiValueType: '',
    dataApiLabelPath: '',
  });
  return facetsConfig;
}

describe('SearchPageComponent', () => {
  let pageConfig: SearchPageConfig;
  let studentService: StudentService;
  let dataService: DataService;
  let activatedRoute: ActivatedRouteStub;
  let searchServiceSpy: MockSearchService;
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    searchServiceSpy = new MockSearchService();
    dataService = new DataService();
    dataService.set('adjacentIds', ['123', '456']);
    studentService = new StudentService(null, null);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MaterialConfigModule, HttpClientModule, RouterTestingModule],
      declarations: [SearchPageComponent, SearchBoxComponent, SearchResultsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: SearchService, useValue: searchServiceSpy },
        { provide: DataService, useValue: dataService },
        { provide: StudentService, useValue: studentService },
        { provide: PersonService, useValue: {} },
        Title,
        NotificationService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        activatedRoute.testParamMap = { page: 'test-page' };

        pageConfig = new SearchPageConfig();
        pageConfig.pageName = 'test-page';

        const config = new Config();
        config.tenant = 'test-tenant';
        config.pages['test-page'] = pageConfig;

        console.log(JSON.stringify(config));
        activatedRoute.testData = { config: config };
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should get a page config', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app.pageConfig).toBeDefined();
  });

  it('should get a config', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app.config).toBeDefined();
  });

  it('should have the title set to the page name', () => {
    const title = fixture.debugElement.injector.get(Title);
    expect(title.getTitle()).toBe('test-page');
  });

  it('should add default sort order if none is defined in the pageConfig', () => {
    expect(component.pageConfig.defaultSort.term).toBe('id');
    expect(component.pageConfig.defaultSort.order).toBe('desc');
  });

  it('should display the upload new document button when enabled', () => {
    let uploadButton = fixture.debugElement.nativeElement.querySelectorAll('.cs-upload-new-document-button');
    expect(uploadButton.length).toEqual(1);

    component.pageConfig.disableUploadNewDocument = true;
    fixture.detectChanges();

    uploadButton = fixture.debugElement.nativeElement.querySelectorAll('.cs-upload-new-document-button');
    expect(uploadButton.length).toEqual(0);

    component.pageConfig.disableUploadNewDocument = false;
    fixture.detectChanges();

    uploadButton = fixture.debugElement.nativeElement.querySelectorAll('.cs-upload-new-document-button');
    expect(uploadButton.length).toEqual(1);
  });

  it('should display the display documents button when enabled', () => {
    let displaySearchButton = fixture.debugElement.nativeElement.querySelectorAll('.cs-display-search-button');
    expect(displaySearchButton.length).toEqual(0);

    component.pageConfig.enableDisplaySearch = true;
    fixture.detectChanges();

    displaySearchButton = fixture.debugElement.nativeElement.querySelectorAll('.cs-display-search-button');
    expect(displaySearchButton.length).toEqual(1);

    component.pageConfig.enableDisplaySearch = false;
    fixture.detectChanges();

    displaySearchButton = fixture.debugElement.nativeElement.querySelectorAll('.cs-display-search-button');
    expect(displaySearchButton.length).toEqual(0);
  });

  it('should show the facets panel and the toggle button if facets are active and a facet exitst in config', () => {
    pageConfig.facetsConfig = getFacetsConfig();

    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isToggleLeftPanelButtonVisible).toBeTrue();
    expect(component.isLeftPanelVisible).toBeTrue();
  });

  it('should hide the facets panel and the toggle button if facets are not active in config', () => {
    pageConfig.facetsConfig.active = false;
    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLeftPanelVisible).toBeFalse();
    expect(component.isToggleLeftPanelButtonVisible).toBeFalse();
  });

  it('should hide the facets panel and the toggle button if facets are active but there are no facets in config', () => {
    pageConfig.facetsConfig.active = true;
    pageConfig.facetsConfig.facets = new Map<string, FacetConfig>();

    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isLeftPanelVisible).toBeFalse();
    expect(component.isToggleLeftPanelButtonVisible).toBeFalse();
  });

  describe('should recover from search error', () => {
    const LongerThanSearchDebounceTime = 200;

    let theSearchService: SearchService;
    let searchSpy: Spy;
    let theNotificationService: NotificationService;
    let notificationErrorSpy: Spy;

    beforeEach(() => {
      component.searchDebounceTime = 1;
      theSearchService = TestBed.inject(SearchService);
      theNotificationService = TestBed.inject(NotificationService);

      searchSpy = spyOn(theSearchService, 'search').and.callThrough();
      notificationErrorSpy = spyOn(theNotificationService, 'error').and.stub();
    });

    it('should inject search & notification services', () => {
      expect(theSearchService).toBeDefined();
      expect(theNotificationService).toBeDefined();
    });

    it('should call searchService AfterViewInit', fakeAsync(() => {
      component.ngOnInit();
      component.ngAfterViewInit();
      tick(LongerThanSearchDebounceTime);

      expect(searchSpy).toHaveBeenCalled();
      expect(searchSpy).toHaveBeenCalledTimes(1);
    }));

    it('should call searchService when searchModel$ changes', fakeAsync(() => {
      component.ngOnInit();
      component.ngAfterViewInit();
      tick(LongerThanSearchDebounceTime);

      component.searchModel$.next(getTestSearchModel('1'));
      tick(LongerThanSearchDebounceTime);
      expect(searchSpy).toHaveBeenCalledTimes(2);
      tick(LongerThanSearchDebounceTime);
    }));

    it('should continue to call searchService after a search failure', fakeAsync(() => {
      component.ngOnInit();
      component.ngAfterViewInit();
      tick(LongerThanSearchDebounceTime);

      // Should notify error
      component.searchModel$.next(getTestSearchModel('ThrowError'));
      tick(LongerThanSearchDebounceTime);
      expect(searchSpy).toHaveBeenCalledTimes(2);
      expect(notificationErrorSpy).toHaveBeenCalledTimes(1);

      // Search should continue to function after error
      component.searchModel$.next(getTestSearchModel(''));
      tick(LongerThanSearchDebounceTime);
      expect(searchSpy).toHaveBeenCalledTimes(3);
    }));
  });

  describe('Bulk Edit Mode', () => {
    const getSearchResults = (count: number = 1): SearchResults => {
      const result = new SearchResults();
      result.total = count;

      for (let i = 0; i < count; i++) {
        const row = new ResultRow();
        row.id = `id-${i}`;
        result.results.push(row);
      }

      return result;
    };

    it('should display the bulk update button when enabled', () => {
      let bulkUpdateButton = fixture.debugElement.queryAll(By.css('.cs-toggle-bulk-update-button'));
      expect(bulkUpdateButton.length).toEqual(0);

      component.pageConfig.enableBulkUpdate = true;
      fixture.detectChanges();

      bulkUpdateButton = fixture.debugElement.queryAll(By.css('.cs-toggle-bulk-update-button'));
      expect(bulkUpdateButton.length).toEqual(1);
    });

    it('should be able to enter and exit bulk update mode by using buttons', () => {
      component.pageConfig.enableBulkUpdate = true;
      fixture.detectChanges();

      // enter bulk edit mode
      let bulkUpdateButton = fixture.debugElement.query(By.css('.cs-toggle-bulk-update-button'));
      bulkUpdateButton.nativeElement.click();
      fixture.detectChanges();

      let title = fixture.debugElement.query(By.css('h2'));
      expect(title.nativeElement.textContent).toBe('Bulk Update Mode');

      // exit bulk edit mode
      bulkUpdateButton = fixture.debugElement.query(By.css('.cs-toggle-bulk-update-button'));
      bulkUpdateButton.nativeElement.click();
      fixture.detectChanges();

      title = fixture.debugElement.query(By.css('h2'));
      expect(title.nativeElement.textContent).toBe('test-page');
    });

    it('should hide facets, search bar and other buttons when entering bulk update mode', () => {
      pageConfig.facetsConfig = getFacetsConfig();
      pageConfig.enableBulkUpdate = true;

      fixture = TestBed.createComponent(SearchPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isLeftPanelVisible).toBeTrue();
      expect(component.isToggleLeftPanelButtonVisible).toBeTrue();
      expect(component.isSearchBoxVisible).toBeTrue();

      // enter bulk edit mode
      component.toggleBulkEditMode();
      fixture.detectChanges();

      expect(component.isLeftPanelVisible).toBeFalse();
      expect(component.isToggleLeftPanelButtonVisible).toBeFalse();
      expect(component.isSearchBoxVisible).toBeFalse();
    });

    it('should freeze results and enable selection of search results when entering bulk update mode', () => {
      component.pageConfig.enableBulkUpdate = true;
      component.toggleBulkEditMode();
      fixture.detectChanges();

      const resultsTable: SearchResultsComponent = fixture.debugElement.query(By.directive(SearchResultsComponent)).componentInstance;
      expect(resultsTable.freezeResults).toBeTrue();
      expect(resultsTable.selectionEnabled).toBeTrue();
    });

    it('should enable the next button and update its text depending of rows are selected', fakeAsync(() => {
      const resultsTable: SearchResultsComponent = fixture.debugElement.query(By.directive(SearchResultsComponent)).componentInstance;
      const searchResult = getSearchResults();
      resultsTable.searchResults$.next(searchResult);

      component.pageConfig.enableBulkUpdate = true;
      component.toggleBulkEditMode();
      fixture.detectChanges();

      let bulkUpdateNextButton = fixture.debugElement.query(By.css('.cs-bulk-update-next-button'));
      expect(bulkUpdateNextButton.attributes['disabled']).toBeTruthy();
      expect(bulkUpdateNextButton.nativeElement.textContent).toContain('Edit 0 Documents');

      // Select an item from the table
      resultsTable.selection.select(searchResult.results[0]);
      tick(100);
      fixture.detectChanges();

      bulkUpdateNextButton = fixture.debugElement.query(By.css('.cs-bulk-update-next-button'));
      expect(bulkUpdateNextButton.attributes['disabled']).toBeFalsy();
      expect(bulkUpdateNextButton.nativeElement.textContent).toContain('Edit 1 Documents');
    }));

    it('should disable the next button if user selects more than the maximum number allowed', fakeAsync(() => {
      const resultsTable: SearchResultsComponent = fixture.debugElement.query(By.directive(SearchResultsComponent)).componentInstance;
      const searchResult = getSearchResults(2);
      resultsTable.searchResults$.next(searchResult);

      component.pageConfig.enableBulkUpdate = true;
      component.bulkEditMaxCount = 1;
      component.toggleBulkEditMode();
      fixture.detectChanges();

      // Select two items from the table
      resultsTable.selection.select(searchResult.results[0]);
      resultsTable.selection.select(searchResult.results[1]);
      tick(100);
      fixture.detectChanges();

      // verify button is disabled
      let bulkUpdateNextButton = fixture.debugElement.query(By.css('.cs-bulk-update-next-button'));
      expect(bulkUpdateNextButton.attributes['disabled']).toBeTruthy();
      expect(bulkUpdateNextButton.nativeElement.textContent).toContain('Edit 2 Documents');

      // De-select one item from the table
      resultsTable.selection.deselect(searchResult.results[0]);
      tick(100);
      fixture.detectChanges();

      // verify button becomes enabled
      bulkUpdateNextButton = fixture.debugElement.query(By.css('.cs-bulk-update-next-button'));
      expect(bulkUpdateNextButton.attributes['disabled']).toBeFalsy();
      expect(bulkUpdateNextButton.nativeElement.textContent).toContain('Edit 1 Documents');
    }));
  });
});
