import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePageComponent } from './create-page.component';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../shared/content.service';
import { Title } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { Observable, of } from 'rxjs';
import { ContentItem } from '../shared/model/content-item';
import { ContentMetadataComponent } from '../content-metadata/content-metadata.component';
import { ContentViewComponent } from '../content-view/content-view.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../user/shared/user.service';
import { ButtonConfig } from '../../core/shared/model/button-config';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { Config } from '../../core/shared/model/config';
import { User } from '../../user/shared/user';
import { FileUploadComponent } from '../../shared/widgets/file-upload/file-upload.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProgressService } from '../../shared/providers/progress.service';
import { HttpClientModule } from '@angular/common/http';
import { Field } from '../../core/shared/model/field';
import { NotificationService } from '../../shared/providers/notification.service';

class MockContentService {
  create(contentItem: ContentItem, file: File): Observable<ContentItem> {
    contentItem.id = '987';
    return of(contentItem);
  }

  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }
}

class MockUserService extends UserService {
  constructor() {
    super(null, null, null);
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

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    mockContentService = new MockContentService();
    mockUserService = new MockUserService();

    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MaterialConfigModule,
        RouterTestingModule,
        MatAutocompleteModule,
        MatOptionModule,
        NoopAnimationsModule,
      ],
      declarations: [CreatePageComponent, ContentMetadataComponent, ContentViewComponent, SafeUrlPipe],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: ContentService, useValue: mockContentService },
        { provide: UserService, useValue: mockUserService },
        ProgressService,
        Title,
        FormBuilder,
        LiveAnnouncer,
        MatSnackBar,
        NotificationService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ContentViewComponent],
        },
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    activatedRoute.testParamMap = { page: 'test-page' };

    const saveButton = new ButtonConfig();
    saveButton.command = 'saveItem';
    saveButton.label = 'Save';

    const createPageConfig = new ContentPageConfig();
    createPageConfig.fieldsToDisplay = [
      Object.assign(new Field(), { key: '1', label: '1' }),
      Object.assign(new Field(), { key: '2', label: '2' }),
      Object.assign(new Field(), { key: '3', label: '3' }),
      Object.assign(new Field(), { key: 'a', label: 'a' }),
    ];
    createPageConfig.buttons = [saveButton];
    createPageConfig.onSave = [
      { key: 'PublishStatus', value: 'Published' },
      { key: 'AnotherOnSave', value: 'Value' },
    ];
    createPageConfig.pageName = 'test-create-page';
    createPageConfig.viewPanel = true;

    const config = new Config();
    config.tenant = 'test-tenant';
    config.pages['create'] = createPageConfig;
    config.contentConfig = {
      account: 'testAccount',
      profile: 'testProfile',
    };

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
});
