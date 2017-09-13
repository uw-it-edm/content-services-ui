import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMetadataComponent } from './content-metadata.component';
import { EditPageConfig } from '../../model/config/edit-page-config';
import { ContentItem } from '../../model/content-item';

describe('ContentMetadataComponent', () => {
  let component: ContentMetadataComponent;
  let fixture: ComponentFixture<ContentMetadataComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ContentMetadataComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentMetadataComponent);
    component = fixture.componentInstance;

    const editPageConfig = new EditPageConfig();
    editPageConfig.pageName = 'test-edit-page';
    editPageConfig.fieldsToDisplay = ['1', '2', '3', 'a'];
    component.pageConfig = editPageConfig;

    const contentItem = new ContentItem();
    contentItem.id = '1a';
    contentItem.label = 'test label';
    contentItem.metadata = new Map();
    contentItem.metadata.set('1', 'one');
    contentItem.metadata.set('2', 'two');
    contentItem.metadata.set('3', 'three');
    contentItem.metadata.set('a', 'a');

    component.contentItem = contentItem;

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it(
    'should contain the defined fields in the proper order',
    async(() => {
      const input = fixture.debugElement.nativeElement.querySelectorAll('input');

      expect(input[0].name).toBe('1');
      expect(input[1].name).toBe('2');
      expect(input[2].name).toBe('3');
      expect(input[3].name).toBe('a');
    })
  );
});
