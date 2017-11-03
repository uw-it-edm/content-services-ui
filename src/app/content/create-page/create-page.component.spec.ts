import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePageComponent } from './create-page.component';
import { HttpModule } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../shared/content.service';
import { Title } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { Observable } from 'rxjs/Observable';
import { ContentItem } from '../shared/model/content-item';
import { ContentMetadataComponent } from '../content-metadata/content-metadata.component';
import { ContentViewComponent } from '../content-view/content-view.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../user/shared/user.service';
import { ButtonConfig } from '../../core/shared/model/button-config';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { PageConfig } from '../../core/shared/model/page-config';
import { Config } from '../../core/shared/model/config';
import { User } from '../../user/shared/user';
import { FileUploadComponent } from '../../shared/widgets/file-upload/file-upload.component';

class MockContentService {
  create(contentItem: ContentItem, file: File): Observable<ContentItem> {
    return Observable.of(contentItem);
  }
}

class MockUserService extends UserService {
  constructor() {
    super(null);
  }

  getUser(): User {
    return new User('testUser');
  }
}

class MockFileUploadComponent extends FileUploadComponent {
  reset(): void {}
}

describe('CreatePageComponent', () => {
  let component: CreatePageComponent;
  let fixture: ComponentFixture<CreatePageComponent>;
  let activatedRoute: ActivatedRouteStub;
  let mockContentService: MockContentService;
  let mockUserService: MockUserService;

  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    mockContentService = new MockContentService();
    mockUserService = new MockUserService();
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [HttpModule, RouterTestingModule],
        declarations: [CreatePageComponent, ContentMetadataComponent, ContentViewComponent, SafeUrlPipe],
        providers: [
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: ContentService, useValue: mockContentService },
          { provide: UserService, useValue: mockUserService },
          Title,
          FormBuilder
        ],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(CreatePageComponent);
          component = fixture.componentInstance;
        });
    })
  );

  beforeEach(() => {
    activatedRoute.testParamMap = { page: 'test-page' };

    const saveButton = new ButtonConfig();
    saveButton.command = 'saveItem';
    saveButton.label = 'Save';

    const createPageConfig = new ContentPageConfig();
    createPageConfig.fieldsToDisplay = [
      { name: '1', label: '1' },
      { name: '2', label: '2' },
      { name: '3', label: '3' },
      { name: 'a', label: 'a' }
    ];
    createPageConfig.buttons = [saveButton];
    createPageConfig.onSave = [
      { name: 'PublishStatus', value: 'Published' },
      { name: 'AnotherOnSave', value: 'Value' }
    ];
    createPageConfig.pageName = 'test-create-page';
    createPageConfig.viewPanel = true;

    const searchPageConfig = new PageConfig();
    searchPageConfig.pageName = 'test-page';
    searchPageConfig.createPageConfig = createPageConfig;

    const config = new Config();
    config.tenant = 'test-tenant';
    config.pages['test-page'] = searchPageConfig;
    config.profile = 'testProfile';
    config.account = 'testAccount';

    activatedRoute.testData = { config: config };

    fixture.detectChanges();
  });
  it('should create', () => {
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
    expect(title.getTitle()).toEqual('test-create-page');
  });

  it('should correctly populate the profileId when preparing to save', () => {
    const contentItem = component.prepareSaveContentItem();
    expect(contentItem.metadata['ProfileId']).toBe('testProfile');
  });
  it('should correctly populate the account when preparing to save', () => {
    const contentItem = component.prepareSaveContentItem();
    expect(contentItem.metadata['Account']).toBe('testAccount/testUser');
  });
  it('should add the specified onSave metadata when preparing to save', () => {
    const contentItem = component.prepareSaveContentItem();
    expect(contentItem.metadata['PublishStatus']).toBe('Published');
    expect(contentItem.metadata['AnotherOnSave']).toBe('Value');
  });
  it('should reset fields', () => {
    component.fileUploadComponent = new MockFileUploadComponent();
    component.createContentItemForm
      .get('metadata')
      .get('1')
      .patchValue('asdf');
    let contentItem = component.prepareSaveContentItem();
    expect(contentItem.metadata['1']).toBe('asdf');
    component.reset();
    contentItem = component.prepareSaveContentItem();
    expect(contentItem.metadata.hasOwnProperty('1')).toBe(true);
    expect(contentItem.metadata['1']).toBe(null);
  });
});
