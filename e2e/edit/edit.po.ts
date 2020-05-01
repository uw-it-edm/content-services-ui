import { browser, by, element, ExpectedConditions } from 'protractor';
import * as path from 'path';

export class EditPage {
  public saveButton = element(by.id('saveItem'));
  public studentInputField = element(by.css('app-student-autocomplete input'));
  public personInputField = element(by.css('app-person-autocomplete input'));
  public profileUrl = `${browser.baseUrl}${this.profile}/edit`;
  public pageUrl = `${this.profileUrl}/${this.id}`;
  public pdfFilePath = path.resolve(__dirname, '../mocks/files/sample-file.pdf');
  public inputField = element(by.id('mat-input-0'));
  public pdfViewerDownloadButton = element(by.buttonText('file_download'));
  public downloadButton = element(by.partialButtonText('Download'));
  public nextItemButton = element(by.id('nextItem'));
  public dateInputField = element.all(by.css('app-timestamp-picker input'));
  public formFields = element.all(by.tagName('mat-form-field'));
  public selectPanel = element(by.className('mat-select-panel'));
  public lockIcons = element.all(by.className('disabled-icon'));
  public disabledFields = element.all(by.css(':disabled'));
  public toggleFullScreenButton = element(by.name('toggleFullScreen'));
  public zoomDropDownList = element(by.name('zoomFactor'));

  constructor(private profile: string = 'demo', private id: string = '123456') {}

  navigateTo(itemId: string = this.id) {
    const destination = this.profileUrl + '/' + itemId;
    return browser.get(destination).catch(() => {
      this.clickAcceptAlert(true);
      return browser.get(destination);
    });
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
    browser.wait(ExpectedConditions.visibilityOf(snackBar), 10000);
    return snackBar.getText();
  }

  getPaginatorText() {
    return element(by.css('app-content-pager > span'))
      .getText()
      .then((text) => {
        return text.trim();
      });
  }

  getFileName(fileIndex: number) {
    return element.all(by.css('.mat-list-item-content .mat-list-text p > span')).then((names) => {
      return names[fileIndex].getText();
    });
  }

  clickDropDownOptionValueByText(optionText: string) {
    element(by.cssContainingText('.mat-option-text', optionText)).click();
    browser.wait(ExpectedConditions.invisibilityOf(this.selectPanel), 5000);
  }

  clickDropDownByLabel(dropDownLabel: string) {
    element(by.cssContainingText('.mat-form-field', dropDownLabel)).click();
    browser.wait(ExpectedConditions.visibilityOf(this.selectPanel), 5000);
  }

  clickAcceptAlert(isAlertUnexpected: boolean = false) {
    browser
      .switchTo()
      .alert()
      .then((alert) => {
        if (isAlertUnexpected) {
          console.log('WARN: Unexpected alert left open from previous test. ');
        }
        alert.accept();
      });
  }
}
