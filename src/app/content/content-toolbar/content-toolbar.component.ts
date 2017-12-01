import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-content-toolbar',
  templateUrl: './content-toolbar.component.html',
  styleUrls: ['./content-toolbar.component.css']
})
export class ContentToolbarComponent {
  @Input() pageCount: number;

  @Output() pageNumberChange = new EventEmitter<number>();
  @Output() showAllChange = new EventEmitter<boolean>();

  pageNumberEntry: string;
  pageNumberTimeout: any;
  pageNumberValue: number;
  showAllValue: boolean;

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

  pageDown() {
    this.pageNumber++;
    // this.pageNumberChange.emit(this.pageNumber + 1);
  }

  pageUp() {
    this.pageNumber--;
    // this.pageNumberChange.emit(this.pageNumber - 1);
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
  }
}
