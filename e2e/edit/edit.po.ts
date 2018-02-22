import {browser, by, element, ExpectedConditions} from 'protractor';
import * as path from 'path';

export class EditPage {
  public saveButton = element(by.id('saveItem'));
  public studentInputField = element(by.css('app-student-autocomplete input'));
  public pageUrl = `${browser.baseUrl}/${this.profile}/edit/${this.id}`;
  public pdfFilePath = path.resolve(__dirname, '../mocks/files/sample-file.pdf');
  public inputField = element(by.id('mat-input-0'));
  public downloadButton = element(by.buttonText('file_download'));

  constructor(private profile: string = 'demo', private id: string = '123456') {
  }

  navigateTo() {
    return browser.get(this.pageUrl);
  }

  getPageTitle() {
    return browser.getTitle();
  }

  clickReturnToResultsLink() {
    element(by.css('[mattooltip=\'Return to Results\']')).click();
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

  getLastModifiedDateText() {
    return element(by.css('[placeholder=\'Last Modified Date\']')).getAttribute('value');
  }

  getStudentText() {
    return this.studentInputField.getAttribute('value');
  }

  getSnackBarText() {
    const snackBar = element(by.className('mat-simple-snackbar'));
    browser.wait(ExpectedConditions.visibilityOf(snackBar), 30000);
    return snackBar.getText();
  }
}
