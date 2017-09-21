import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericPageComponent } from './generic-page.component';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { Config } from '../../model/config/config';
import { PageConfig } from '../../model/config/page-config';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SearchBoxComponent } from '../../widgets/search-box/search-box.component';
import { SearchResultsComponent } from '../../widgets/search-results/search-results.component';
import { SearchService } from '../../services/search.service';
import { Observable } from 'rxjs/Observable';
import { SearchResults } from '../../model/search-result';
import { HttpModule } from '@angular/http';
import { SearchModel } from '../../model/search/search-model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

let activatedRoute: ActivatedRouteStub;
let searchServiceSpy: MockSearchService;
let component: GenericPageComponent;
let fixture: ComponentFixture<GenericPageComponent>;

class MockSearchService {
  search(terms: Observable<SearchModel>, pageConfig: PageConfig): Observable<SearchResults> {
    return Observable.of(new SearchResults());
  }
}

describe('GenericPageComponent', () => {
  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    searchServiceSpy = new MockSearchService();
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, MaterialConfigModule, HttpModule],
        declarations: [GenericPageComponent, SearchBoxComponent, SearchResultsComponent],
        providers: [
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: SearchService, useValue: searchServiceSpy },
          Title
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(
    async(() => {
      activatedRoute.testParamMap = { page: 'test-page' };

      const pageConfig = new PageConfig();
      pageConfig.pageName = 'test-page';

      const config = new Config();
      config.tenant = 'test-tenant';
      config.pages['test-page'] = pageConfig;

      console.log(JSON.stringify(config));
      activatedRoute.testData = { config: config };
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericPageComponent);
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
});
