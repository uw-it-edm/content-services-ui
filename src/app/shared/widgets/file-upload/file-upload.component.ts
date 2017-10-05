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
  @Input() previewData$: Subject<any>; // may be string or array buffer
  @Input() formGroup: FormGroup;

  private file: File;

  @Output() fileSelected: EventEmitter<File> = new EventEmitter();

  constructor() {}

  ngOnInit() {
    this.formGroup.setControl(this.fieldName, new FormControl('', Validators.required));
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      this.formGroup.get(this.fieldName).markAsDirty();
      this.handleInputChange(event);
    } else {
      this.fileSelected.emit(null);
      this.formGroup.get(this.fieldName).markAsPristine();
    }
  }

  handleInputChange(e) {
    this.file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    this.fileSelected.emit(this.file);

    const mimeType = this.file.type;
    const reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);

    // TODO: improve mime-type handline
    if (mimeType === 'application/pdf') {
      reader.readAsArrayBuffer(this.file);
    } else {
      reader.readAsDataURL(this.file);
    }
  }

  private _handleReaderLoaded(e) {
    const reader = e.target;
    this.previewData$.next(reader.result);
  }
}
