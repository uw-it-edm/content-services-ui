import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericPageComponent } from './generic-page.component';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { Config } from '../../model/config';
import { PageConfig } from '../../model/page-config';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SearchBoxComponent } from '../../widgets/search-box/search-box.component';
import { SearchResultsComponent } from '../../widgets/search-results/search-results.component';
import { SearchService } from '../../services/search.service';
import { Observable } from 'rxjs/Observable';
import { SearchResults } from '../../model/search-result';
import { HttpModule } from '@angular/http';

let activatedRoute: ActivatedRouteStub;
let component: GenericPageComponent;
let fixture: ComponentFixture<GenericPageComponent>;
let searchServiceSpy;

describe('GenericPageComponent', () => {
  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialConfigModule, HttpModule],
      declarations: [GenericPageComponent, SearchBoxComponent, SearchResultsComponent],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        SearchService,
        Title,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));


    beforeEach(async(() => {
      activatedRoute.testParamMap = { page: 'test-page' };

    const pageConfig = new PageConfig();
    pageConfig.pageName = 'test-page';

    const config = new Config();
    config.tenant = 'test-tenant';
    config.pages['test-page'] = pageConfig;

    console.log(JSON.stringify(config));
    activatedRoute.testData = {config: config};
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const searchService = fixture.debugElement.injector.get(SearchService);
    searchServiceSpy = spyOn(searchService, 'search')
      .and.returnValue(new Observable<SearchResults>());
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
});
