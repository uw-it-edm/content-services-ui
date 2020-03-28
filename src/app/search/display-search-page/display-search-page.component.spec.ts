import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

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
import { DisplaySearchPageComponent } from './display-search-page.component';
import { MatAutocompleteModule, MatDatepickerModule, MatOptionModule } from '@angular/material';
import { ProgressService } from '../../shared/providers/progress.service';
import { ContentService } from '../../content/shared/content.service';
import { ContentItem } from '../../content/shared/model/content-item';
import Spy = jasmine.Spy;

let studentService: StudentService;
let dataService: DataService;
let activatedRoute: ActivatedRouteStub;
let searchServiceSpy: MockSearchService;
let component: DisplaySearchPageComponent;
let fixture: ComponentFixture<DisplaySearchPageComponent>;

class MockSearchService {
  search(terms: SearchModel, pageConfig: SearchPageConfig): Observable<SearchResults> {
    if (terms.stringQuery === 'ThrowError') {
      return throwError('An Error Occurred');
    }
    return of(new SearchResults());
  }
}

class MockContentService {
  read(itemId: string): Observable<ContentItem> {
    const defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata['1'] = 'one';
    defaultContentItem.metadata['2'] = 'two';
    defaultContentItem.metadata['3'] = 'three';
    defaultContentItem.metadata['a'] = 'a';
    defaultContentItem.metadata['b'] = 'asdf';
    defaultContentItem.metadata['t'] = 't';
    return of(defaultContentItem);
  }

  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }

  update(contentItem: ContentItem, file?: File): Observable<ContentItem> {
    return of(contentItem);
  }
}

describe('DisplaySearchPageComponent', () => {
  let mockContentService: MockContentService;

  beforeEach(async(() => {
    mockContentService = new MockContentService();
    activatedRoute = new ActivatedRouteStub();
    searchServiceSpy = new MockSearchService();
    dataService = new DataService();
    dataService.set('adjacentIds', ['123', '456']);
    studentService = new StudentService(null, null);

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        HttpClientModule,
        MaterialConfigModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatOptionModule
      ],
      declarations: [DisplaySearchPageComponent, SearchBoxComponent, SearchResultsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: SearchService, useValue: searchServiceSpy },
        { provide: DataService, useValue: dataService },
        { provide: ContentService, useValue: mockContentService },
        ProgressService,
        Title,
        NotificationService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents()
      .then(() => {
        activatedRoute.testParamMap = { page: 'test-page' };
        activatedRoute.testQueryParamMap = { s: JSON.stringify(new SearchModel()) };

        const pageConfig = new SearchPageConfig();
        pageConfig.pageName = 'test-page';

        const config = new Config();
        config.tenant = 'test-tenant';
        config.pages['test-page'] = pageConfig;

        console.log(JSON.stringify(config));
        activatedRoute.testData = { config: config };
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplaySearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const searchService = fixture.debugElement.injector.get(SearchService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should get a page config', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app.pageConfig).toBeDefined();
  });

  describe('should recover from search error', () => {
    const LongerThanSearchDebounceTime = 500;

    let theSearchService: SearchService;
    let searchSpy: Spy;
    let theNotificationService: NotificationService;
    let notificationErrorSpy: Spy;

    beforeEach(() => {
      theSearchService = TestBed.get(SearchService);
      theNotificationService = TestBed.get(NotificationService);

      searchSpy = spyOn(theSearchService, 'search').and.callThrough();
      notificationErrorSpy = spyOn(theNotificationService, 'error').and.stub();
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
      const searchModel = new SearchModel();
      searchModel.stringQuery = 'test';
      component.searchModel$.next(searchModel);
      tick(LongerThanSearchDebounceTime);
      expect(searchSpy).toHaveBeenCalledTimes(2);
    }));

    it('should call searchService onSearch failure', fakeAsync(() => {
      component.ngOnInit();
      tick(LongerThanSearchDebounceTime);

      // Should notify error
      const searchModel = new SearchModel();
      searchModel.stringQuery = 'ThrowError';
      component.searchModel$.next(searchModel);
      tick(LongerThanSearchDebounceTime);
      expect(searchSpy).toHaveBeenCalledTimes(2);
      expect(notificationErrorSpy).toHaveBeenCalledTimes(1);

      // Search should continue to function after error
      searchModel.stringQuery = '';
      component.searchModel$.next(searchModel);
      tick(LongerThanSearchDebounceTime);
      expect(searchSpy).toHaveBeenCalledTimes(3);
    }));
  });
});
