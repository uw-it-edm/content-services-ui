import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPageComponent } from './edit-page.component';
import { ContentMetadataComponent } from '../content-metadata/content-metadata.component';
import { ContentViewComponent } from '../content-view/content-view.component';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentService } from '../shared/content.service';
import { HttpModule } from '@angular/http';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { ContentItem } from '../shared/model/content-item';
import { Observable } from 'rxjs/Observable';

import { By, Title } from '@angular/platform-browser';
import { EditPageConfig } from '../../core/shared/model/edit-page-config';
import { Config } from '../../core/shared/model/config';
import { PageConfig } from '../../core/shared/model/page-config';
import { FormBuilder } from '@angular/forms';
import { SafeUrlPipe } from '../../util/safe-url.pipe';

class MockContentService {
  read(itemId: string): Observable<ContentItem> {
    return Observable.of(new ContentItem());
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
  const editPageConfig = new EditPageConfig();

  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    contentServiceSpy = new MockContentService();
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [HttpModule],
        declarations: [EditPageComponent, ContentMetadataComponent, ContentViewComponent, SafeUrlPipe],
        providers: [
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: ContentService, useValue: contentServiceSpy },
          Title,
          FormBuilder
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(
    async(() => {
      activatedRoute.testParamMap = { page: 'test-page' };

      editPageConfig.pageName = 'test-edit-page';
      editPageConfig.viewPanel = true;

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

  it('should display the content metadata component when a content item exists', () => {
    const contentArea = fixture.debugElement.nativeElement.querySelectorAll('app-content-metadata');
    expect(contentArea.length).toBe(1);
  });

  it('should display the content view component when a content item exists and view panel is true', () => {
    editPageConfig.viewPanel = true;
    const contentArea = fixture.debugElement.nativeElement.querySelectorAll('app-content-view');
    expect(contentArea.length).toBe(1);
  });

  it('should not display the content view component when view panel is false', () => {
    editPageConfig.viewPanel = false;
    const contentArea = fixture.debugElement.nativeElement.querySelectorAll('app-content-view');
    expect(contentArea.length).toBe(1);
  });
});
