import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadComponent } from './file-upload.component';
import { Subject } from 'rxjs/Subject';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [FileUploadComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    component.fieldName = 'upload';
    component.previewUrl$ = new Subject<string>();
    component.formGroup = new FormGroup({});
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
  it('should be have the provided name', () => {
    expect(component.fieldName).toBe('upload');
  });
});
