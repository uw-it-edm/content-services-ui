import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadComponent } from './file-upload.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

function getFakeEventData(): any {
  return {
    dataTransfer: {
      files: FileList,
      types: ['Files']
    },
    target: {
      files: FileList,
      types: ['Files']
    },
    preventDefault: () => {},
    stopPropagation: () => {}
  };
}

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let dropZone: DebugElement;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [MatButtonModule, ReactiveFormsModule],
        declarations: [FileUploadComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    component.fieldName = 'upload';
    component.formGroup = new FormGroup({});
    dropZone = fixture.debugElement.query(By.css('#drop-zone'));
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  it('should be have the provided name', () => {
    expect(component.fieldName).toBe('upload');
  });

  it('handles drop event', () => {
    spyOn(component, 'onDrop');

    dropZone.triggerEventHandler('drop', getFakeEventData());

    expect(component.onDrop).toHaveBeenCalled();
  });
  it('handles dragover event', () => {
    spyOn(component, 'onDragOver');

    dropZone.triggerEventHandler('dragover', getFakeEventData());

    expect(component.onDragOver).toHaveBeenCalled();
  });

  it('should reset', () => {
    const blob = new Blob([''], { type: 'text/html' });
    blob['lastModifiedDate'] = '';
    blob['name'] = 'filename';
    const fakeFile = <File>blob;

    component.files.push(fakeFile);
    expect(component.files.length).toBe(1);
    component.reset();
    expect(component.files.length).toBe(0);
  });
});
