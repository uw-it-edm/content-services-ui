import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { EditPageComponent } from './edit-page.component';
import { ContentMetadataComponent } from '../content-metadata/content-metadata.component';
import { ContentViewComponent } from '../content-view/content-view.component';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentService } from '../shared/content.service';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { ContentItem } from '../shared/model/content-item';
import { Observable, of } from 'rxjs';

import { Title } from '@angular/platform-browser';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { Config } from '../../core/shared/model/config';
import { FormBuilder } from '@angular/forms';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { ButtonConfig } from '../../core/shared/model/button-config';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProgressService } from '../../shared/providers/progress.service';
import { ContentObject } from '../shared/model/content-object';
import { ContentObjectListComponent } from '../content-object-list/content-object-list.component';
import { HttpClientModule } from '@angular/common/http';
import { FieldOption } from '../../core/shared/model/field/field-option';
import { Field } from '../../core/shared/model/field';
import { NotificationService } from '../../shared/providers/notification.service';

class MockContentService {
  read(itemId: string): Observable<ContentItem> {
    const defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata['1'] = 'one';
    defaultContentItem.metadata['2'] = 'two';
    defaultContentItem.metadata['3'] = 'three';
    defaultContentItem.metadata['a'] = 'a';
    defaultContentItem.metadata['b'] = 'asdf';
    defaultContentItem.metadata['t'] = 't';
    defaultContentItem.metadata['Account'] = 'Test-Account'; // WCC account
    return of(defaultContentItem);
  }

  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }

  update(contentItem: ContentItem, file?: File): Observable<ContentItem> {
    return of(contentItem);
  }
}

class MockUserService extends UserService {
  constructor() {
    super(null, null, null);
  }

  getUser(): User {
    const user = new User('testUser');
    user.accounts['Test-Account'] = 'rwd'; // user has 'rwd' permissions on Test-Account
    return user;
  }
}

describe('EditPageComponent', () => {
  let component: EditPageComponent;
  let fixture: ComponentFixture<EditPageComponent>;
  let activatedRoute: ActivatedRouteStub;
  let mockContentService: MockContentService;
  let mockUserService: MockUserService;
  let editPageConfig: ContentPageConfig;

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
        MatDatepickerModule,
        MatOptionModule,
        NoopAnimationsModule,
      ],
      declarations: [EditPageComponent, ContentMetadataComponent, ContentViewComponent, SafeUrlPipe],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: ContentService, useValue: mockContentService },
        Title,
        FormBuilder,
        MatSnackBar,
        ProgressService,
        NotificationService,
        { provide: UserService, useValue: mockUserService },
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
        fixture = TestBed.createComponent(EditPageComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    activatedRoute.testParamMap = { id: '1', page: 'test-page' };

    const deleteButton = new ButtonConfig();
    deleteButton.command = 'deleteItem';
    deleteButton.label = 'Delete';

    const saveButton = new ButtonConfig();
    saveButton.command = 'saveItem';
    saveButton.label = 'Save';

    editPageConfig = new ContentPageConfig();
    editPageConfig.fieldsToDisplay = [
      Object.assign(new Field(), { key: '1', label: '1' }),
      Object.assign(new Field(), { key: '2', label: '2' }),
      Object.assign(new Field(), { key: '3', label: '3' }),
      Object.assign(new Field(), { key: 'a', label: 'a' }),
      Object.assign(new Field(), { key: 'd', label: 'd', dataType: 'date' }),
      Object.assign(new Field(), {
        key: 't',
        label: 't',
        dataType: 'string',
        displayType: 'typeahead',
        options: [new FieldOption('o1'), new FieldOption('o2')],
      }),
    ];
    editPageConfig.buttons = [deleteButton, saveButton];

    editPageConfig.pageName = 'test-edit-page';
    editPageConfig.viewPanel = false;
    editPageConfig.enableDelete = true;

    const config = new Config();
    config.tenant = 'test-tenant';
    config.pages['edit'] = editPageConfig;

    activatedRoute.testData = { config: config };

    component.contentObject = new ContentObject();
    component.ngOnInit();
    fixture.detectChanges();
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
    expect(title.getTitle()).toEqual('test-edit-page');
  });

  it('should display the content metadata component when a content item exists', () => {
    const contentArea = fixture.debugElement.nativeElement.querySelectorAll('app-content-metadata');
    expect(contentArea.length).toEqual(1);
  });

  it('should display the content view component when a content item exists and view panel is true', () => {
    editPageConfig.viewPanel = true;
    fixture.detectChanges();
    const contentArea = fixture.debugElement.nativeElement.querySelectorAll('.cs-content-view-wrapper-insert');
    expect(contentArea.length).toEqual(1);
  });

  it('should not display the content view component when view panel is false', () => {
    const contentArea = fixture.debugElement.nativeElement.querySelectorAll('.cs-content-view-wrapper-insert');
    expect(contentArea.length).toEqual(0);
  });

  it('should display the remove-button when view panel is true', () => {
    editPageConfig.viewPanel = true;
    fixture.detectChanges();
    const button = fixture.debugElement.nativeElement.querySelectorAll('.remove-button');
    expect(button.length).toEqual(1);
  });

  it('should not display the remove button when view panel is false', () => {
    const button = fixture.debugElement.nativeElement.querySelectorAll('.remove-button');
    expect(button.length).toEqual(0);
  });

  it('should not display the remove button when enableDelete is false', () => {
    editPageConfig.viewPanel = true;
    editPageConfig.enableDelete = false;
    fixture.detectChanges();
    const button = fixture.debugElement.nativeElement.querySelectorAll('.remove-button');
    expect(button.length).toEqual(0);
  });

  it('should contain buttons to save and delete items in the proper order', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('button');
    let deleteButton;
    let saveButton;
    for (const button of buttons) {
      if (button.id === 'deleteItem') {
        deleteButton = button;
      }
      if (button.id === 'saveItem') {
        saveButton = button;
      }
    }
    expect(deleteButton).toBeTruthy();
    expect(saveButton).toBeTruthy();
    expect(deleteButton.id).toEqual(editPageConfig.buttons[0].command);
    expect(saveButton.id).toEqual(editPageConfig.buttons[1].command);
  });

  it('should delegate save to content object list', () => {
    const metataDataGroup = component.form.controls['metadata'];
    metataDataGroup.patchValue({ '1': 'a spec title' });
    fixture.detectChanges();
    component.contentObjectListComponent = new ContentObjectListComponent(null, null, null, null, null, null);

    const spy = spyOn(component.contentObjectListComponent, 'saveItem');

    component.saveItem();
    expect(spy).toHaveBeenCalled();
  });
});
