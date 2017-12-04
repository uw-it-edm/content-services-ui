import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  @Input() fieldName: string;
  @Input() label: string;
  @Input() formGroup: FormGroup;
  @Input() autoFocus = false;
  @Input() multiple = false;
  @Input() dropzone = false;
  @Output() fileSelected: EventEmitter<File> = new EventEmitter();

  files: File[] = new Array<File>();

  constructor() {}

  ngOnInit() {
    this.formGroup.setControl(this.fieldName, new FormControl('', Validators.required));
  }

  onFileChange(event) {
    const fileList: FileList = event.target.files;
    this.selectFiles(fileList);
  }

  private selectFiles(fileList: FileList) {
    for (let i = 0; i < fileList.length; i++) {
      this.files.push(fileList.item(i));
    }
    this.emitFiles();
  }

  private emitFiles() {
    if (this.files.length > 0) {
      this.formGroup.get(this.fieldName).markAsDirty();
      for (const file of this.files) {
        this.fileSelected.emit(file);
      }
      this.files = [];
    } else {
      this.fileSelected.emit(null);
      this.formGroup.get(this.fieldName).reset();
      this.formGroup.get(this.fieldName).markAsPristine();
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const fileList = event.dataTransfer.files;
    this.selectFiles(fileList);
  }

  onDragOver(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  removeFile(file) {
    const index: number = this.files.indexOf(file);
    if (index !== -1) {
      this.files.splice(index, 1);
      this.emitFiles();
    }
  }

  reset() {
    this.files = [];
    this.emitFiles();
  }
}
