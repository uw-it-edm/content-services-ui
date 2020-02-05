import { browser, by, element, ExpectedConditions } from 'protractor';
import { protractor } from 'protractor/built/ptor';

export class CreatePage {
  public pageUrl = `${browser.baseUrl}/${this.profile}/create`;
  public uploadFilePanel = element(by.id('drop-zone'));
  public fileList = element.all(by.tagName('mat-list-item'));
  public inputField = element(by.id('mat-input-0'));
  public errorNotification = element(by.className('error'));
  public uploadAnotherCheckbox = element.all(by.name('uploadAnother')).get(1);
  public studentInput = element(by.css('app-student-autocomplete input'));
  public personInput = element(by.css('app-person-autocomplete input'));
  public filerInput = element(by.name('Filer'));
  public saveButton = element(by.id('saveItem'));
  public cancelButton = element(by.id('cancel'));
  public clearButton = element(by.buttonText('clear'));
  public pdfViewer = element(by.tagName('pdf-viewer'));
  public formFields = element.all(by.tagName('mat-form-field'));
  public requiredFields = this.formFields.all(by.css("[required='']"));
  public dismissButton = element(by.buttonText('Dismiss'));
  public selectPanel = element(by.className('mat-select-panel'));
  public metadataErrorMessages = element.all(by.className('mat-error'));
  public dropDownOptions = element.all(by.className('mat-option'));
  public dateInputField = element.all(by.css('app-timestamp-picker input'));
  public datePickerCalenderButton = element.all(by.css('.mat-datepicker-toggle button'));
  public calendarPeriodButton = element.all(by.className('mat-calendar-period-button'));
  public calendarDisabledSelections = element.all(by.className('mat-calendar-body-disabled'));

  constructor(private profile: string = 'demo') {}

  navigateTo() {
    return browser.get(this.pageUrl).catch(() => {
      browser
        .switchTo()
        .alert()
        .then(alert => {
          console.log('WARN: Unexpected alert left open from previous test. ');
          alert.accept();
        });
      return browser.get(this.pageUrl);
    });
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

  getPersonValue() {
    return this.personInput.getAttribute('value');
  }

  clickDropDownOptionValueByText(optionText: string) {
    element(by.cssContainingText('.mat-option-text', optionText)).click();
    browser.wait(ExpectedConditions.invisibilityOf(this.selectPanel), 5000);
  }

  clickDropDownByLabel(dropDownLabel: string) {
    this.getFormFieldByLabel(dropDownLabel).click();
    browser.wait(ExpectedConditions.visibilityOf(this.selectPanel), 5000);
  }

  getFormFieldByLabel(dropDownLabel: string) {
    return element(by.cssContainingText('.mat-form-field', dropDownLabel));
  }

  populateRequiredFields(shouldClearFieldValue: boolean = false) {
    this.requiredFields.each(requiredField => {
      requiredField.getTagName().then(tagName => {
        switch (tagName) {
          case 'input': {
            if (shouldClearFieldValue) {
              requiredField.clear();
              requiredField.sendKeys(protractor.Key.TAB);
            } else {
              requiredField.sendKeys('12/31/2019');
            }
            break;
          }
          case 'app-course-input':
          /* falls through */
          case 'app-options-input': {
            requiredField.click();
            if (shouldClearFieldValue) {
              this.dropDownOptions.get(0).sendKeys(protractor.Key.TAB);
            } else {
              this.dropDownOptions.get(0).click();
            }
            break;
          }
          case 'app-student-autocomplete': {
            if (shouldClearFieldValue) {
              this.studentInput.click();
              this.studentInput.sendKeys(protractor.Key.TAB);
            } else {
              this.studentInput.sendKeys('test student');
              this.dropDownOptions.get(0).click();
            }
            break;
          }
          case 'app-person-autocomplete': {
            if (shouldClearFieldValue) {
              this.personInput.click();
              this.personInput.sendKeys(protractor.Key.TAB);
            } else {
              this.personInput.sendKeys('test person');
              this.dropDownOptions.get(0).click();
            }
            break;
          }
          default: {
            console.log('Unknown required input field with tag: ' + tagName);
            break;
          }
        }
      });
    });
  }

  clickAcceptAlert() {
    browser
      .switchTo()
      .alert()
      .then(alert => {
        alert.accept();
      });
  }
}
