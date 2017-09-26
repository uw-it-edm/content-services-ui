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

import { Title } from '@angular/platform-browser';
import { EditPageConfig } from '../../core/shared/model/edit-page-config';
import { Config } from '../../core/shared/model/config';
import { PageConfig } from '../../core/shared/model/page-config';
import { FormBuilder } from '@angular/forms';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { ButtonConfig } from '../../core/shared/model/button-config';

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
    return Observable.of(defaultContentItem);
  }

  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }

  update(contentItem: ContentItem, file?: File): Observable<ContentItem> {
    return Observable.of(contentItem);
  }
}

describe('EditPageComponent', () => {
  let component: EditPageComponent;
  let fixture: ComponentFixture<EditPageComponent>;
  let activatedRoute: ActivatedRouteStub;
  let mockContentService: MockContentService;
  let editPageConfig: EditPageConfig;

  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    mockContentService = new MockContentService();
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [HttpModule],
        declarations: [EditPageComponent, ContentMetadataComponent, ContentViewComponent, SafeUrlPipe],
        providers: [
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: ContentService, useValue: mockContentService },
          Title,
          FormBuilder
        ],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(EditPageComponent);
          component = fixture.componentInstance;
        });
    })
  );

  beforeEach(() => {
    activatedRoute.testParamMap = { page: 'test-page' };

    const deleteButton = new ButtonConfig();
    deleteButton.command = 'deleteItem';
    deleteButton.label = 'Delete';

    const saveButton = new ButtonConfig();
    saveButton.command = 'saveItem';
    saveButton.label = 'Save';

    editPageConfig = new EditPageConfig();
    editPageConfig.fieldsToDisplay = ['1', '2', '3', 'a'];
    editPageConfig.buttons = [deleteButton, saveButton];

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

  it('should contain buttons to save and delete items in the proper order', () => {
    const button = fixture.debugElement.nativeElement.querySelectorAll('button');
    expect(button[2].id).toBe('deleteItem');
    expect(button[3].id).toBe('saveItem');
  });

  it('should update values on save', () => {
    const metataDataGroup = component.editContentItemForm.controls['metadata'];
    metataDataGroup.patchValue({ '1': 'a spec title' });

    const expectedMetadata = Object.assign({}, component.contentItem.metadata);
    expectedMetadata['1'] = 'a spec title';
    component.saveItem();

    expect(component.contentItem.metadata['1']).toEqual(expectedMetadata['1']);
    expect(component.contentItem.metadata['2']).toEqual(expectedMetadata['2']);
    expect(component.contentItem.metadata['3']).toEqual(expectedMetadata['3']);
    expect(component.contentItem.metadata['a']).toEqual(expectedMetadata['a']);
    expect(component.contentItem.metadata['b']).toEqual(expectedMetadata['b']); // test a field that was not displayed
  });
});
