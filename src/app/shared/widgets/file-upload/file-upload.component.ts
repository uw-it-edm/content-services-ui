import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  @Input() fieldName: string;
  @Input() formGroup: FormGroup;

  // private file: File;

  @Output() fileSelected: EventEmitter<File> = new EventEmitter();

  constructor() {}

  ngOnInit() {
    this.formGroup.setControl(this.fieldName, new FormControl('', Validators.required));
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      this.formGroup.get(this.fieldName).markAsDirty();
      const file = event.dataTransfer ? event.dataTransfer.files[0] : fileList[0];
      this.fileSelected.emit(file);
    } else {
      this.fileSelected.emit(null);
      this.formGroup.get(this.fieldName).markAsPristine();
    }
  }
}
