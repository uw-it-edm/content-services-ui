import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SearchPageComponent } from './search-page.component';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
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

let studentService: StudentService;
let dataService: DataService;
let activatedRoute: ActivatedRouteStub;
let searchServiceSpy: MockSearchService;
let component: SearchPageComponent;
let fixture: ComponentFixture<SearchPageComponent>;

class MockSearchService {
  search(terms: SearchModel, pageConfig: SearchPageConfig): Observable<SearchResults> {
    if (terms.stringQuery === 'ThrowError') {
      return throwError('An Error Occurred');
    }
    return of(new SearchResults());
  }
}

describe('SearchPageComponent', () => {
  let pageConfig: SearchPageConfig;

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
        { provide: PersonService, useValue: {} },
        Title,
        NotificationService
      ],
      schemas: [NO_ERRORS_SCHEMA]
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
    pageConfig.facetsConfig.active = true;
    pageConfig.facetsConfig.facets = new Map<string, FacetConfig>();
    pageConfig.facetsConfig.facets.set('myFacet', {
      key: 'metadata.mybooleanfield',
      label: 'My boolean',
      order: 'asc',
      size: 3,
      maxSize: 50,
      dataApiValueType: '',
      dataApiLabelPath: ''
    });

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
    let searchSpy;
    let searchModel: SearchModel;
    let theNotificationService;
    let notificationErrorSpy;

    beforeEach(() => {
      component.searchDebounceTime = 1;
      theSearchService = TestBed.get(SearchService);
      theNotificationService = TestBed.get(NotificationService);

      searchSpy = spyOn(theSearchService, 'search').and.callThrough();
      notificationErrorSpy = spyOn(theNotificationService, 'error').and.stub();

      searchModel = new SearchModel();
    });

    it('should inject search & notification services', () => {
      expect(theSearchService).toBeDefined();
      expect(theNotificationService).toBeDefined();
    });

    it('should call searchService onInit', fakeAsync(() => {
      component.ngOnInit();
      tick(LongerThanSearchDebounceTime);

      expect(searchSpy).toHaveBeenCalled();
      expect(searchSpy).toHaveBeenCalledTimes(1);
    }));

    it('should call searchService onSearch', fakeAsync(() => {
      component.ngOnInit();
      tick(LongerThanSearchDebounceTime);

      component.onSearch(searchModel);
      tick(LongerThanSearchDebounceTime);
      expect(searchSpy).toHaveBeenCalledTimes(2);
    }));

    it('should call searchService onSearch failure', fakeAsync(() => {
      component.ngOnInit();
      tick(LongerThanSearchDebounceTime);

      // Should notify error
      searchModel.stringQuery = 'ThrowError';
      component.onSearch(searchModel);
      tick(LongerThanSearchDebounceTime);
      expect(searchSpy).toHaveBeenCalledTimes(2);
      expect(notificationErrorSpy).toHaveBeenCalledTimes(1);

      // Search should continue to function after error
      searchModel.stringQuery = '';
      component.onSearch(searchModel);
      tick(LongerThanSearchDebounceTime);
      expect(searchSpy).toHaveBeenCalledTimes(3);
    }));
  });
});
