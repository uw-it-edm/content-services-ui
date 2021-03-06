import { Observable, of } from 'rxjs';
import { ContentService, FileUrlParameters } from '../shared/content.service';
import { ContentItem } from '../shared/model/content-item';
import { Config, ContentConfig } from '../../core/shared/model/config';
import { ContentObjectListComponent } from './content-object-list.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Field } from '../../core/shared/model/field';
import { User } from '../../user/shared/user';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../user/shared/user.service';
import { Title } from '@angular/platform-browser';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { FileUploadComponent } from '../../shared/widgets/file-upload/file-upload.component';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { RouterTestingModule } from '@angular/router/testing';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FocusDirective } from '../../shared/directives/focus/focus.directive';
import { FieldOption } from '../../core/shared/model/field/field-option';
import { NotificationService } from '../../shared/providers/notification.service';
import { first } from 'rxjs/operators';

const testFile = new File(['This is a test file'], 'test.pdf', { type: 'application/pdf' });
const testFormData = {
  metadata: {
    1: 'asdf',
  },
};

class MockContentService extends ContentService {
  constructor() {
    super(null, null, null);
  }

  create(contentItem: ContentItem, file: File): Observable<ContentItem> {
    return of(contentItem);
  }

  getFileUrl({ itemId, webViewable, useOriginalFilename, disposition }: FileUrlParameters): string {
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

describe('ContentObjectList', () => {
  let mockContentService: ContentService;
  let mockUserService: MockUserService;
  let activatedRoute: ActivatedRouteStub;
  let component: ContentObjectListComponent;
  let fixture: ComponentFixture<ContentObjectListComponent>;
  const sourceItem: ContentItem = null;
  const config = new Config();
  config.contentConfig = new ContentConfig();
  config.contentConfig.profile = 'testProfile';
  const formModel = {
    metadata: {
      1: 'test',
    },
  };
  const field = new Field();
  field.key = '1';
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
        HttpClientModule,
        MaterialConfigModule,
        MatButtonModule,
        MatTooltipModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: ContentService, useValue: mockContentService },
        { provide: UserService, useValue: mockUserService },
        Title,
        FormBuilder,
        LiveAnnouncer,
        MatSnackBar,
        NotificationService,
      ],
      declarations: [FileUploadComponent, ContentObjectListComponent, TruncatePipe, FocusDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentObjectListComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    component.contentItem = undefined;
    component.page = undefined;

    const editPageConfig = new ContentPageConfig();
    editPageConfig.pageName = 'test-edit-page';
    editPageConfig.fieldsToDisplay = [
      Object.assign(new Field(), { key: '1', label: 'First' }),
      Object.assign(new Field(), { key: '2', label: 'Second' }),
      Object.assign(new Field(), { key: '3', label: 'Third' }),
      Object.assign(new Field(), { key: 'a', label: 'a' }),
      Object.assign(new Field(), { key: 'd', label: 'd', displayType: 'date' }),
      Object.assign(new Field(), {
        key: 't',
        label: 't',
        displayType: 'autocomplete',
        options: [new FieldOption('o1'), new FieldOption('o2'), new FieldOption('o3')],
      }),
    ];
    editPageConfig.viewPanel = false;
    config.pages['edit'] = editPageConfig;
    activatedRoute.testData = { config: config };

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly populate the profileId when preparing to save', () => {
    const contentItem = component.prepareItem(sourceItem, fields, formModel, config, user);
    expect(contentItem.metadata['ProfileId']).toBe('testProfile');
  });

  it('should populate the account when preparing to save', () => {
    config.contentConfig.account = 'testAccount';
    const contentItem = component.prepareItem(sourceItem, fields, formModel, config, user);
    expect(contentItem.metadata['Account']).toBe('testAccount');
  });

  it('should populate the account replacing user template when preparing to save', () => {
    config.contentConfig.account = 'testAccount/${user}';
    const contentItem = component.prepareItem(sourceItem, fields, formModel, config, user);
    expect(contentItem.metadata['Account']).toBe('testAccount/testUser');
  });

  it('should add the specified metadata overrides when preparing to save', () => {
    const metadataOverrides = [
      { name: 'PublishStatus', value: 'Published' },
      { name: 'AnotherOnSave', value: 'Value' },
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
      type: 'application/pdf',
    };
    const file = new File(['This is a test file'], 'test.pdf', properties);
    const index = component.addFile(file);
    expect(component.contentObjects.length).toBe(1);
    component.removeObject(undefined, index);
  });

  it('should replace a file on a persisted content item', () => {
    const properties = {
      type: 'application/pdf',
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

  it('should create item on save', () => {
    const properties = {
      type: 'application/pdf',
    };
    const file = new File(['This is a test file'], 'test.pdf', properties);
    component.addFile(file);
    expect(component.contentObjects.length).toBe(1);
    const formData = {
      metadata: {
        1: 'asdf',
      },
    };
    const metadataOverrides = new Array<any>();
    const mockContentServiceCreate = spyOn(mockContentService, 'create');

    component.saveItem(fields, formData, metadataOverrides);
    expect(mockContentServiceCreate).toHaveBeenCalled();
  });

  /**
   * Addresses bug CAB-4036: New revision was created sometimes when only metadata was changed
   */
  it('should update item and clear file on save', (done: DoneFn) => {
    const contentItem = new ContentItem();
    const metadataOverrides = new Array<any>();
    const mockContentServiceUpdate = spyOn(mockContentService, 'update').and.returnValue(of(contentItem));

    // Setup a document update by loading the content item and replacing the file.
    component.addItem(contentItem);
    component.replace(component.contentObjects[0], testFile);

    // Update the document.
    component.saveItem(fields, testFormData, metadataOverrides);

    // Subscribe to event when saving is completed (can be done here because 'saveItem' is asynchronous).
    const subscription = component.saving.pipe(first((val) => !val)).subscribe(() => {
      subscription.unsubscribe();

      // Verify the replaced file is supplied to service.
      expect(mockContentServiceUpdate).toHaveBeenCalledWith(jasmine.anything(), testFile);

      // Update document again, verify that file is NOT supplied to service.
      mockContentServiceUpdate.calls.reset();
      component.saveItem(fields, testFormData, metadataOverrides);
      expect(mockContentServiceUpdate).toHaveBeenCalledWith(jasmine.anything(), null);

      done();
    });
  });

  it('should emit saving event on save', () => {
    const formData = {
      metadata: {
        1: 'asdf',
      },
    };
    const metadataOverrides = new Array<any>();

    spyOn(component.saving, 'emit');
    component.saveItem(fields, formData, metadataOverrides);

    expect(component.saving.emit).toHaveBeenCalledWith(true);
  });
});
