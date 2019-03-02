import { async, ComponentFixture, TestBed } from '@angular/core/testing';

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
import { Observable, of } from 'rxjs';
import { SearchResults } from '../shared/model/search-result';
import { SearchModel } from '../shared/model/search-model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DataService } from '../../shared/providers/data.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { StudentService } from '../../shared/providers/student.service';
import { NotificationService } from '../../shared/providers/notification.service';
import { PersonService } from '../../shared/providers/person.service';

let studentService: StudentService;
let dataService: DataService;
let activatedRoute: ActivatedRouteStub;
let searchServiceSpy: MockSearchService;
let component: SearchPageComponent;
let fixture: ComponentFixture<SearchPageComponent>;

class MockSearchService {
  search(terms: Observable<SearchModel>, pageConfig: SearchPageConfig): Observable<SearchResults> {
    return of(new SearchResults());
  }
}

describe('SearchPageComponent', () => {
  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    searchServiceSpy = new MockSearchService();
    dataService = new DataService();
    dataService.set('adjacentIds', ['123', '456']);
    studentService = new StudentService(null, null);
  });

  beforeEach(async(() => {
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
        NotificationService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(async(() => {
    activatedRoute.testParamMap = { page: 'test-page' };

    const pageConfig = new SearchPageConfig();
    pageConfig.pageName = 'test-page';

    const config = new Config();
    config.tenant = 'test-tenant';
    config.pages['test-page'] = pageConfig;

    console.log(JSON.stringify(config));
    activatedRoute.testData = { config: config };
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPageComponent);
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
});
