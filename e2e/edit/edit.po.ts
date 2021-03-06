import { browser, by, element, ExpectedConditions } from 'protractor';
import * as path from 'path';
import { ContentMetadataPageObject } from '../page-objects/content-metadata.po';

export class EditPage {
  public saveButton = element(by.id('saveItem'));
  public studentInputField = element(by.css('app-student-autocomplete input'));
  public personInputField = element(by.css('app-person-autocomplete input'));
  public profileUrl = `${browser.baseUrl}${this.profile}/edit`;
  public pageUrl = `${this.profileUrl}/${this.id}`;
  public pdfFilePath = path.resolve(__dirname, '../mocks/files/sample-file.pdf');
  public inputFields = element.all(by.className('mat-input-element'));
  public pdfViewerDownloadButton = element(by.buttonText('file_download'));
  public downloadButton = element(by.partialButtonText('Download'));
  public nextItemButton = element(by.id('nextItem'));
  public dateInputField = element.all(by.css('app-timestamp-picker input'));
  public formFields = element.all(by.css('app-content-metadata mat-form-field'));
  public selectPanel = element(by.className('mat-select-panel'));
  public autocompleteSelectPanel = element(by.className('mat-autocomplete-panel'));
  public lockIcons = element.all(by.className('disabled-icon'));
  public disabledFields = element.all(by.css(':disabled'));
  public toggleFullScreenButton = element(by.name('toggleFullScreen'));
  public zoomDropDownList = element(by.name('zoomFactor'));
  public replaceFileElement = element(by.name('replaceFile'));
  public removeDocButton = element(by.id('removeItem'));

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
    this.replaceFileElement.sendKeys(filePath);
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

  clickAutocompleteDropDownByLabel(dropDownLabel: string) {
    element(by.cssContainingText('.mat-form-field', dropDownLabel)).click();
    browser.wait(ExpectedConditions.visibilityOf(this.autocompleteSelectPanel), 5000);
  }

  clickAutocompleteDropDownOptionValueByText(optionText: string) {
    element(by.cssContainingText('.mat-option-text', optionText)).click();
    browser.wait(ExpectedConditions.invisibilityOf(this.autocompleteSelectPanel), 5000);
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

  /**
   * Gets a page object to interact with the content metadata component.
   */
  get fields(): ContentMetadataPageObject {
    return new ContentMetadataPageObject(element(by.tagName('app-content-metadata')));
  }
}
