import {browser, by, element, ExpectedConditions} from 'protractor';

export class CreatePage {
  public pageUrl = `${browser.baseUrl}/${this.profile}/create`;
  public uploadFilePanel = element(by.id('drop-zone'));
  public fileList = element.all(by.tagName('mat-list-item'));
  public inputField = element(by.id('mat-input-0'));
  public errorNotification = element(by.className('error'));
  public uploadAnotherCheckbox = element.all(by.name('uploadAnother')).get(1);
  public studentInput = element(by.css('app-student-autocomplete input'));

  constructor(private profile: string = 'demo') {
  }

  navigateTo() {
    return browser.get(this.pageUrl);
  }

  getPageTitle() {
    return browser.getTitle();
  }

  addFile(filePath: string) {
    element(by.name('addFile')).sendKeys(filePath);
  }

  chooseFile(filePath: string) {
    element(by.id('attach-files')).sendKeys(filePath);
  }

  getPdfViewer() {
    return element(by.tagName('pdf-viewer'));
  }

  clickCancelButton() {
    element(by.id('cancel')).click();
  }

  clickReturnToResultsButton() {
    element(by.css('[mattooltip=\'Return to Results\']')).click();
  }

  clickAppName() {
    element(by.className('cs-title')).click();
  }

  getContentViewerText() {
    return element(by.css('.content-object-display .custom-text-rendered')).getText();
  }

  undoFile() {
    element(by.css('[mattooltip=\'Undo\']')).click();
  }

  getFileName(fileIndex: number) {
    return element.all(by.css('.mat-list-item-content .mat-list-text p > span')).then(names => {
      return names[fileIndex].getText();
    });
  }

  clickSave() {
    element(by.id('saveItem')).click();
  }

  replaceFile(fileIndex: number, filePath: string) {
    element.all(by.name('replaceFile')).then(replaceButtons => {
      replaceButtons[fileIndex].sendKeys(filePath);
    });
  }

  getSnackBarText() {
    const snackBar = element(by.className('mat-simple-snackbar'));
    browser.wait(ExpectedConditions.visibilityOf(snackBar), 10000);
    return snackBar.getText();
  }

  dismissSnackBar() {
    element(by.buttonText('Dismiss')).click();
  }

  getStudentValue() {
    return this.studentInput.getAttribute('value');
  }

  clickAutoCompletedOption() {
    const autoCompletePanel = element(by.className('mat-autocomplete-panel'));
    browser.wait(ExpectedConditions.visibilityOf(autoCompletePanel), 10000);
    autoCompletePanel.element(by.css('.mat-option-text')).click();
  }
}
