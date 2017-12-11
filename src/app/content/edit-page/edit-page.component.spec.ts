import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
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

import { Title } from '@angular/platform-browser';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { Config } from '../../core/shared/model/config';
import { PageConfig } from '../../core/shared/model/page-config';
import { FormBuilder } from '@angular/forms';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { ButtonConfig } from '../../core/shared/model/button-config';
import {
  MatAutocompleteModule,
  MatDatepickerModule,
  MatOptionModule,
  MatSnackBar,
  MatSnackBarContainer
} from '@angular/material';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProgressService } from '../../shared/providers/progress.service';
import { ContentObject } from '../shared/model/content-object';

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
    return Observable.of(defaultContentItem);
  }

  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }

  update(contentItem: ContentItem, file?: File): Observable<ContentItem> {
    return Observable.of(contentItem);
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

describe('EditPageComponent', () => {
  let component: EditPageComponent;
  let fixture: ComponentFixture<EditPageComponent>;
  let activatedRoute: ActivatedRouteStub;
  let mockContentService: MockContentService;
  let mockUserService: MockUserService;
  let editPageConfig: ContentPageConfig;

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
          MatAutocompleteModule,
          MatDatepickerModule,
          MatOptionModule,
          NoopAnimationsModule
        ],
        declarations: [EditPageComponent, ContentMetadataComponent, ContentViewComponent, SafeUrlPipe],
        providers: [
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: ContentService, useValue: mockContentService },
          Title,
          FormBuilder,
          MatSnackBar,
          ProgressService,
          { provide: UserService, useValue: mockUserService }
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
          fixture = TestBed.createComponent(EditPageComponent);
          component = fixture.componentInstance;
        });
    })
  );

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
      { name: '1', label: '1' },
      { name: '2', label: '2' },
      { name: '3', label: '3' },
      { name: 'a', label: 'a' },
      { name: 'd', label: 'd', dataType: 'date' },
      { name: 't', label: 't', dataType: 'string', displayType: 'typeahead', options: ['o1', 'o2'] }
    ];
    editPageConfig.buttons = [deleteButton, saveButton];

    editPageConfig.pageName = 'test-edit-page';
    editPageConfig.viewPanel = false;

    const searchPageConfig = new PageConfig();
    searchPageConfig.pageName = 'test-page';
    searchPageConfig.editPageConfig = editPageConfig;

    const config = new Config();
    config.tenant = 'test-tenant';
    config.pages['test-page'] = searchPageConfig;

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
    // editPageConfig.viewPanel = false;
    const contentArea = fixture.debugElement.nativeElement.querySelectorAll('.cs-content-view-wrapper-insert');
    expect(contentArea.length).toEqual(0);
  });

  it('should contain buttons to save and delete items in the proper order', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('button');
    let foundDeleteButton = false;
    let foundSaveButton = false;
    for (const button of buttons) {
      if (button.id === 'deleteItem') {
        foundDeleteButton = true;
      }
      if (button.id === 'saveItem') {
        foundSaveButton = true;
      }
    }
    expect(foundDeleteButton).toBeTruthy();
    expect(foundSaveButton).toBeTruthy();
  });

  // it('should delegate save to content object list', () => {
  //   const metataDataGroup = component.form.controls['metadata'];
  //   metataDataGroup.patchValue({ '1': 'a spec title' });
  //
  //   const spy = spyOn(component.contentObjectListComponent, 'saveItem');
  //   component.saveItem();
  //   expect(spy).toHaveBeenCalled();
  //
  // });
});
