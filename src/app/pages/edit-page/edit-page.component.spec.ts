import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPageComponent } from './edit-page.component';
import { ContentMetadataComponent } from '../../widgets/content-metadata/content-metadata.component';
import { ContentViewComponent } from '../../widgets/content-view/content-view.component';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { HttpModule } from '@angular/http';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { ContentResult } from '../../model/content-result';
import { Observable } from 'rxjs/Observable';
import { By, Title } from '@angular/platform-browser';
import { EditPageConfig } from '../../model/config/edit-page-config';
import { Config } from '../../model/config/config';
import { PageConfig } from '../../model/config/page-config';

class MockContentService {
  read(itemId: string): Observable<ContentResult> {
    return Observable.of(new ContentResult());
  }

  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }
}

describe('EditPageComponent', () => {
  let component: EditPageComponent;
  let fixture: ComponentFixture<EditPageComponent>;
  let activatedRoute: ActivatedRouteStub;
  let contentServiceSpy: MockContentService;

  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    contentServiceSpy = new MockContentService();
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [HttpModule],
        declarations: [EditPageComponent, ContentMetadataComponent, ContentViewComponent],
        providers: [
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: ContentService, useValue: contentServiceSpy },
          Title
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(
    async(() => {
      activatedRoute.testParamMap = { page: 'test-page' };

      const editPageConfig = new EditPageConfig();
      editPageConfig.pageName = 'test-edit-page';

      const searchPageConfig = new PageConfig();
      searchPageConfig.pageName = 'test-page';
      searchPageConfig.editPageConfig = editPageConfig;

      const config = new Config();
      config.tenant = 'test-tenant';
      config.pages['test-page'] = searchPageConfig;

      console.log(JSON.stringify(config));
      activatedRoute.testData = { config: config };
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const contentService = fixture.debugElement.injector.get(ContentService);
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
    expect(title.getTitle()).toBe('test-edit-page');
  });
});
