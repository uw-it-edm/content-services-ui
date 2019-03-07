import {browser, by, element, ExpectedConditions} from 'protractor';
import * as path from 'path';

export class EditPage {
  public saveButton = element(by.id('saveItem'));
  public studentInputField = element(by.css('app-student-autocomplete input'));
  public personInputField = element(by.css('app-person-autocomplete input'));
  public profileUrl = `${browser.baseUrl}/${this.profile}/edit`;
  public pageUrl = `${this.profileUrl}/${this.id}`;
  public pdfFilePath = path.resolve(__dirname, '../mocks/files/sample-file.pdf');
  public inputField = element(by.id('mat-input-0'));
  public pdfViewerDownloadButton = element(by.buttonText('file_download'));
  public downloadButton = element(by.partialButtonText('Download'));
  public nextItemButton = element(by.id('nextItem'));
  public dateInputField = element.all(by.css('app-timestamp-picker input'));
  public formFields = element.all(by.tagName('mat-form-field'));

  constructor(private profile: string = 'demo', private id: string = '123456') {}

  navigateTo(itemId: string = this.id) {
    return browser.get(this.profileUrl + '/' + itemId);
  }

  getPageTitle() {
    return browser.getTitle();
  }

  clickReturnToResultsLink() {
    element(by.buttonText('keyboard_arrow_left')).click();
  }

  replaceFile(filePath: string = this.pdfFilePath) {
    element(by.name('replaceFile')).sendKeys(filePath);
  }

  getPdfViewer() {
    return element(by.tagName('pdf-viewer'));
  }

  removeFile() {
    element(by.css('app-file-upload button.mat-button')).click();
  }

  getDateText(dateInputFieldIndex: number = 0) {
    return this.dateInputField.get(dateInputFieldIndex).getAttribute('value');
  }

  getStudentText() {
    return this.studentInputField.getAttribute('value');
  }

  getPersonText() {
    return this.personInputField.getAttribute('value');
  }

  getSnackBarText() {
    const snackBar = element(by.className('mat-simple-snackbar'));
    browser.wait(ExpectedConditions.visibilityOf(snackBar), 5000);
    return snackBar.getText();
  }

  getPaginatorText() {
    return element(by.css('app-content-pager > span'))
      .getText()
      .then(text => {
        return text.trim();
      });
  }

  getFileName(fileIndex: number) {
    return element.all(by.css('.mat-list-item-content .mat-list-text p > span')).then(names => {
      return names[fileIndex].getText();
    });
  }
}
