import {browser, by, element, ExpectedConditions} from 'protractor';

export class CreatePage {
  public pageUrl = `${browser.baseUrl}/${this.profile}/create`;
  public uploadFilePanel = element(by.id('drop-zone'));
  public fileList = element.all(by.tagName('mat-list-item'));
  public inputField = element(by.id('mat-input-0'));
  public errorNotification = element(by.className('error'));
  public uploadAnotherCheckbox = element.all(by.name('uploadAnother')).get(1);
  public studentInput = element(by.css('app-student-autocomplete input'));
  public saveButton = element(by.id('saveItem'));
  public clearButton = element(by.buttonText('clear'));
  public pdfViewer = element(by.tagName('pdf-viewer'));
  public formFields = element.all(by.tagName('mat-form-field'));

  constructor(private profile: string = 'demo') {}

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

  clickCancelButton() {
    element(by.id('cancel')).click();
  }

  clickReturnToResultsButton() {
    element(by.buttonText('keyboard_arrow_left')).click();
  }

  clickAppName() {
    element(by.className('cs-title')).click();
  }

  getContentViewerText() {
    return element(by.css('.content-object-display .custom-text-rendered')).getText();
  }

  getFileName(fileIndex: number) {
    return element.all(by.css('.mat-list-item-content .mat-list-text p > span')).then(names => {
      return names[fileIndex].getText();
    });
  }

  replaceFile(fileIndex: number, filePath: string) {
    element.all(by.name('replaceFile')).then(replaceButtons => {
      replaceButtons[fileIndex].sendKeys(filePath);
    });
  }

  getSnackBarText() {
    const snackBar = element(by.className('mat-simple-snackbar'));
    browser.wait(ExpectedConditions.visibilityOf(snackBar), 5000);
    return snackBar.getText();
  }

  getStudentValue() {
    return this.studentInput.getAttribute('value');
  }
}
