import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMetadataComponent } from './content-metadata.component';
import { EditPageConfig } from '../../model/config/edit-page-config';
import { ContentItem } from '../../model/content-item';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ContentMetadataComponent', () => {
  let component: ContentMetadataComponent;
  let fixture: ComponentFixture<ContentMetadataComponent>;
  let defaultContentItem: ContentItem;
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [ContentMetadataComponent],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(ContentMetadataComponent);
          component = fixture.componentInstance;
        });
    })
  );

  beforeEach(() => {
    const editPageConfig = new EditPageConfig();
    editPageConfig.pageName = 'test-edit-page';
    editPageConfig.fieldsToDisplay = ['1', '2', '3', 'a'];
    component.pageConfig = editPageConfig;

    defaultContentItem = new ContentItem();
    defaultContentItem.id = '1a';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata = new Map();
    defaultContentItem.metadata.set('1', 'one');
    defaultContentItem.metadata.set('2', 'two');
    defaultContentItem.metadata.set('3', 'three');
    defaultContentItem.metadata.set('a', 'a');
    component.contentItem = defaultContentItem;

    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should contain the defined fields in the proper order',
    async(() => {
      const input = fixture.debugElement.nativeElement.querySelectorAll('input');
      expect(input[0].name).toBe('label');
      expect(input[1].name).toBe('1');
      expect(input[2].name).toBe('2');
      expect(input[3].name).toBe('3');
      expect(input[4].name).toBe('a');
    })
  );
  it('should contain the default values', () => {
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.contentItem).toBe(defaultContentItem);
    const label = component.editContentItemForm.controls['label'];
    expect(label.value).toBe('test label');
    const metataDataGroup = component.editContentItemForm.controls['metadata'];
    expect(metataDataGroup.value).toBe({ 1: 'one', 2: 'two', 3: 'three', a: 'a' });
  });
});
