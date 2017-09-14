import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMetadataComponent } from './content-metadata.component';
import { EditPageConfig } from '../../model/config/edit-page-config';
import { ContentItem } from '../../model/content-item';
import { ReactiveFormsModule } from '@angular/forms';

describe('ContentMetadataComponent', () => {
  let component: ContentMetadataComponent;
  let fixture: ComponentFixture<ContentMetadataComponent>;
  let defaultContentItem: ContentItem;
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [ContentMetadataComponent]
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
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata['1'] = 'one';
    defaultContentItem.metadata['2'] = 'two';
    defaultContentItem.metadata['3'] = 'three';
    defaultContentItem.metadata['a'] = 'a';
    defaultContentItem.metadata['b'] = 'asdf';
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
    const label = component.editContentItemForm.controls['label'];
    expect(label.value).toBe('test label');
    const metataDataGroup = component.editContentItemForm.controls['metadata'];
    expect(metataDataGroup.value).toEqual({ '1': 'one', '2': 'two', '3': 'three', a: 'a' });
  });

  it('should update values on save', () => {
    const metataDataGroup = component.editContentItemForm.controls['metadata'];
    metataDataGroup.patchValue({ '1': 'a spec title' });

    component.onSubmit();

    const expectedMetadata = Object.assign({}, defaultContentItem.metadata);
    expectedMetadata['1'] = 'a spec title';

    expect(component.contentItem.metadata['1']).toEqual(expectedMetadata['1']);
    expect(component.contentItem.metadata['2']).toEqual(expectedMetadata['2']);
    expect(component.contentItem.metadata['3']).toEqual(expectedMetadata['3']);
    expect(component.contentItem.metadata['a']).toEqual(expectedMetadata['a']);
    expect(component.contentItem.metadata['b']).toEqual(expectedMetadata['b']); // test a field that was not displayed
  });
});
