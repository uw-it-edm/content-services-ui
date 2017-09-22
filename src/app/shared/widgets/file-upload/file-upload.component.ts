import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  /*
  *
  * TODO: is this overly complex to configure?
  * - too many inputs & confusing output
  * */

  @Input() fieldName: string;
  @Input() previewUrl$: Subject<string>;
  @Input() formGroup: FormGroup;
  private file: File;

  @Output() fileChanged: EventEmitter<string> = new EventEmitter(); // TODO: What should this be called?
  @Output() fileSelected: EventEmitter<File> = new EventEmitter(); // TODO: What should this be called?

  constructor() {}

  ngOnInit() {
    this.formGroup.setControl(this.fieldName, new FormControl('', Validators.required));
  }

  fileChange(event) {
    this.fileChanged.emit('fileChanged for: ' + this.fieldName);
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      this.formGroup.get(this.fieldName).markAsDirty();
      this.handleInputChange(event);
    } else {
      this.formGroup.get(this.fieldName).markAsPristine();
    }
  }

  // TODO: what if not webviewable?
  handleInputChange(e) {
    this.file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    console.log('attaching file: ' + this.file);
    this.fileSelected.emit(this.file);

    const reader = new FileReader();

    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(this.file);
  }

  _handleReaderLoaded(e) {
    const reader = e.target;
    this.previewUrl$.next(reader.result);
  }
}
