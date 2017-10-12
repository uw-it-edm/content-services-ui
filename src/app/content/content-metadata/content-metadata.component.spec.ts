import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMetadataComponent } from './content-metadata.component';
import { ContentItem } from '../shared/model/content-item';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MdButtonModule, MdFormFieldModule, MdInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EditPageConfig } from '../../core/shared/model/edit-page-config';
import { Observable } from 'rxjs/Observable';

describe('ContentMetadataComponent', () => {
  let component: ContentMetadataComponent;
  let fixture: ComponentFixture<ContentMetadataComponent>;
  let defaultContentItem: ContentItem;
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, MdFormFieldModule, MdInputModule, MdButtonModule, ReactiveFormsModule],
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
    editPageConfig.fieldsToDisplay = [
      { name: '1', label: 'First' },
      { name: '2', label: 'Second' },
      { name: '3', label: 'Third' },
      { name: 'a', label: 'a' }
    ];
    editPageConfig.viewPanel = false;
    component.pageConfig = editPageConfig;

    defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata['1'] = 'one';
    defaultContentItem.metadata['2'] = 'two';
    defaultContentItem.metadata['3'] = 'three';
    defaultContentItem.metadata['a'] = 'a';
    defaultContentItem.metadata['b'] = 'asdf';
    component.contentItem$ = Observable.of(defaultContentItem);
    component.formGroup = new FormGroup({});

    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should contain the defined fields in the proper order', () => {
    const input = fixture.debugElement.nativeElement.querySelectorAll('input');
    expect(input[0].name).toBe('label');
    expect(input[1].name).toBe('1');
    expect(input[2].name).toBe('2');
    expect(input[3].name).toBe('3');
    expect(input[4].name).toBe('a');
  });
  it('should contain the defined field label placeholders', () => {
    const input = fixture.debugElement.nativeElement.querySelectorAll('input');
    expect(input[0].placeholder).toBe('label');
    expect(input[1].placeholder).toBe('First');
    expect(input[2].placeholder).toBe('Second');
    expect(input[3].placeholder).toBe('Third');
    expect(input[4].placeholder).toBe('a');
  });

  it('should contain the default values', () => {
    const label = component.formGroup.controls['label'];
    expect(label.value).toBe('test label');
    const metaDataGroup = component.formGroup.controls['metadata'];
    expect(metaDataGroup.value).toEqual({ '1': 'one', '2': 'two', '3': 'three', a: 'a' });
  });
});
