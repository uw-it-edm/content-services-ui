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
import { MatAutocompleteModule, MatOptionModule, MatSnackBar, MatSnackBarContainer } from '@angular/material';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockContentService {
  create(contentItem: ContentItem, file: File): Observable<ContentItem> {
    contentItem.id = '987';
    return Observable.of(contentItem);
  }
  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }
}

class MockUserService extends UserService {
  constructor() {
    super(null, null);
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
        imports: [
          HttpModule,
          MaterialConfigModule,
          RouterTestingModule,
          MatAutocompleteModule,
          MatOptionModule,
          NoopAnimationsModule
        ],
        declarations: [CreatePageComponent, ContentMetadataComponent, ContentViewComponent, SafeUrlPipe],
        providers: [
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: ContentService, useValue: mockContentService },
          { provide: UserService, useValue: mockUserService },
          Title,
          FormBuilder,
          LiveAnnouncer,
          MatSnackBar
        ],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .overrideModule(BrowserDynamicTestingModule, {
          set: {
            entryComponents: [ContentViewComponent]
          }
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

  it('should add a file to the transaction and select the object', () => {
    const properties = {
      type: 'application/pdf'
    };
    const file = new File(['This is a test file'], 'test.pdf', properties);
    const index = component.addFile(file);
    expect(component.transaction.contentObjects.length).toBe(1);
    component.removeFile(index);
  });

  it('should replace a file on a persisted content item', () => {
    const properties = {
      type: 'application/pdf'
    };
    const item = new ContentItem();
    item.id = '123';
    item.metadata = new Map<string, string>();
    item.metadata.set('MimeType', 'application/pdf');
    item.metadata.set('FileSize', '2000');
    item.metadata.set('OriginalFileName', 'file123.pdf');

    const index = component.transaction.addItem(item);
    const co = component.transaction.contentObjects[index];
    const file = new File(['This is a test file'], 'test.pdf', properties);
    component.replaceFile(co, file);
    expect(component.transaction.contentObjects.length).toBe(1);
    expect(co.file).toBe(file);
    expect(co.url).toBe('testUrl/123');
    component.transaction.removeContentObject(index);
  });

  it('should save item and reset fields', () => {
    const properties = {
      type: 'application/pdf'
    };
    const file = new File(['This is a test file'], 'test.pdf', properties);
    const index = component.addFile(file);
    expect(component.transaction.contentObjects.length).toBe(1);
    component.form
      .get('metadata')
      .get('1')
      .patchValue('asdf');
    component.saveItem();
    expect(component.contentItems.length).toBe(1);
    const item = component.contentItems[0];
    expect(item.id).toBe('987');
    expect(item.metadata['1']).toBe('asdf');
    component.reset();
    expect(component.form.get('metadata').get('1').value).toBeNull();
  });
});
