import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-content-toolbar',
  templateUrl: './content-toolbar.component.html',
  styleUrls: ['./content-toolbar.component.css']
})
export class ContentToolbarComponent {
  @Input() contentType: string;
  @Input() pageCount: number;
  @Input() downloadUrl?: string;
  @Input() allowPageByPageMode: boolean;

  @Output() fullScreenChange = new EventEmitter<boolean>();
  @Output() pageNumberChange = new EventEmitter<number>();
  @Output() showAllChange = new EventEmitter<boolean>();
  @Output() zoom = new EventEmitter<string>();

  fullScreen = false;
  pageNumberEntry: string;
  pageNumberTimeout: any;
  pageNumberValue: number;
  showAllValue: boolean;
  zoomFactor = 'automatic-zoom';

  constructor() {}

  @Input()
  get pageNumber() {
    return this.pageNumberValue;
  }

  set pageNumber(value) {
    this.pageNumberEntry = '' + value;
    this.pageNumberValue = value;
    this.pageNumberChange.emit(value);
  }

  @Input()
  get showAll() {
    return this.showAllValue;
  }

  set showAll(value) {
    this.showAllValue = value;
    this.showAllChange.emit(value);
  }

  changePageNumber(page: string) {
    const number = parseInt(page, 10);
    this.pageNumberTimeout = setTimeout(() => {
      const entry = parseInt(this.pageNumberEntry, 10);
      if (!entry || entry !== this.pageNumber) {
        this.pageNumberEntry = '' + this.pageNumber;
        console.log('Reverted page back to ' + this.pageNumberEntry);
      }
    }, 1000);
    if (number && number > 0 && number < this.pageCount) {
      this.pageNumber = number;
    }
  }

  changeZoomFactor(factor: string) {
    this.zoom.emit(factor);
  }

  pageDown() {
    this.pageNumber++;
  }

  pageUp() {
    this.pageNumber--;
  }

  toggleFullScreen() {
    this.fullScreen = !this.fullScreen;
    this.fullScreenChange.emit(this.fullScreen);
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
  }

  download() {
    window.location.href = this.downloadUrl;
  }
}
