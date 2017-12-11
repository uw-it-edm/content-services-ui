import { Observable } from 'rxjs/Observable';
import { ContentService } from '../shared/content.service';
import { ContentItem } from '../shared/model/content-item';
import { Config } from '../../core/shared/model/config';
import { ContentObjectListComponent } from './content-object-list.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Field } from '../../core/shared/model/field';
import { User } from '../../user/shared/user';
import { MatButtonModule, MatSnackBar, MatTooltipModule } from '@angular/material';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../user/shared/user.service';
import { Title } from '@angular/platform-browser';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { FocusModule } from 'angular2-focus/src/focus.module';
import { FileUploadComponent } from '../../shared/widgets/file-upload/file-upload.component';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpModule } from '@angular/http';
import { PageConfig } from '../../core/shared/model/page-config';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockContentService extends ContentService {
  constructor() {
    super(null, null, null);
  }
  create(contentItem: ContentItem, file: File): Observable<ContentItem> {
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

describe('ContentObjectList', () => {
  let mockContentService: ContentService;
  let mockUserService: MockUserService;
  let activatedRoute: ActivatedRouteStub;
  let component: ContentObjectListComponent;
  let fixture: ComponentFixture<ContentObjectListComponent>;
  const sourceItem: ContentItem = null;
  const config = new Config();
  config.profile = 'testProfile';
  const formModel = {};
  const field = new Field();
  field.name = '1';
  const fields = new Array<Field>();
  fields.push(field);
  const user = new User('testUser');

  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    mockContentService = new MockContentService();
    mockUserService = new MockUserService();
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpModule,
        MaterialConfigModule,
        MatButtonModule,
        MatTooltipModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        FocusModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: ContentService, useValue: mockContentService },
        { provide: UserService, useValue: mockUserService },
        Title,
        FormBuilder,
        LiveAnnouncer,
        MatSnackBar
      ],
      declarations: [FileUploadComponent, ContentObjectListComponent, TruncatePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentObjectListComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    component.contentItem = undefined;
    component.page = undefined;
    const searchPageConfig = new PageConfig();
    searchPageConfig.pageName = 'test-page';
    const editPageConfig = new ContentPageConfig();
    editPageConfig.pageName = 'test-edit-page';
    editPageConfig.fieldsToDisplay = [
      { name: '1', label: 'First' },
      { name: '2', label: 'Second' },
      { name: '3', label: 'Third' },
      { name: 'a', label: 'a' },
      { name: 'd', label: 'd', displayType: 'date' },
      { name: 't', label: 't', displayType: 'autocomplete', options: ['o1', 'o2', 'o3'] }
    ];
    editPageConfig.viewPanel = false;
    searchPageConfig.editPageConfig = editPageConfig;
    config.pages['test-page'] = searchPageConfig;
    activatedRoute.testData = { config: config };

    component.ngOnInit();
    fixture.detectChanges();
  });
  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  it('should correctly populate the profileId when preparing to save', () => {
    const contentItem = component.prepareItem(sourceItem, fields, formModel, config);
    expect(contentItem.metadata['ProfileId']).toBe('testProfile');
  });
  it('should populate the account when preparing to save', () => {
    config.account = 'testAccount';
    const contentItem = component.prepareItem(sourceItem, fields, formModel, config, user);
    expect(contentItem.metadata['Account']).toBe('testAccount');
  });
  it('should populate the account replacing user template when preparing to save', () => {
    config.account = 'testAccount/${user}';
    const contentItem = component.prepareItem(sourceItem, fields, formModel, config, user);
    expect(contentItem.metadata['Account']).toBe('testAccount/testUser');
  });
  it('should add the specified metadata overrides when preparing to save', () => {
    const metadataOverrides = [
      { name: 'PublishStatus', value: 'Published' },
      { name: 'AnotherOnSave', value: 'Value' }
    ];
    const contentItem = component.prepareItem(sourceItem, fields, formModel, config, user, metadataOverrides);
    expect(contentItem.metadata['PublishStatus']).toBe('Published');
    expect(contentItem.metadata['AnotherOnSave']).toBe('Value');
  });
  it('should create a content object with an initialized contentItemUrl', () => {
    const contentItem = new ContentItem();
    contentItem.id = '123';
    const index = component.addItem(contentItem);
    const contentObject = component.contentObjects[index];
    component.onDisplayType(contentObject, 'anyvalue');
    expect(contentObject.url).toBe('testUrl/123');
  });
  it('should add a file to the transaction and select the object', () => {
    const properties = {
      type: 'application/pdf'
    };
    const file = new File(['This is a test file'], 'test.pdf', properties);
    const index = component.addFile(file);
    expect(component.contentObjects.length).toBe(1);
    component.removeObject(undefined, index);
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

    const index = component.addItem(item);
    const co = component.contentObjects[index];
    const file = new File(['This is a test file'], 'test.pdf', properties);
    component.replace(co, file);
    expect(component.contentObjects.length).toBe(1);
    expect(co.file).toBe(file);
    expect(co.url).toBe('testUrl/123');
    component.removeContentObject(index);
  });
  it('should save item', () => {
    const properties = {
      type: 'application/pdf'
    };
    const file = new File(['This is a test file'], 'test.pdf', properties);
    const index = component.addFile(file);
    expect(component.contentObjects.length).toBe(1);
    const formData = {
      metadata: {
        1: 'asdf'
      }
    };
    const metadataOverrides = new Array<any>();
    const mockContentServiceCreate = spyOn(mockContentService, 'create');

    component.saveItem(fields, formData, metadataOverrides);
    expect(mockContentServiceCreate).toHaveBeenCalled();
  });
});
