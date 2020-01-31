import { CreatePage } from './create.po';
import { SearchPage } from '../search/search.po';
import { browser, ElementArrayFinder } from 'protractor';
import * as path from 'path';
import { until } from 'selenium-webdriver';
import { protractor } from 'protractor/built/ptor';
import { ContentServicesUiPage } from '../app/app.po';

const demoConfig = require('../mocks/profile-api/demo.json');
const pdfFilePath = path.resolve(__dirname, '../mocks/files/sample-file.pdf');
const docFilePath = path.resolve(__dirname, '../mocks/files/sample-file.docx');
const textFilePath = path.resolve(__dirname, '../mocks/files/sample-file.txt');

const getCurrentUrl = function() {
  return browser.getCurrentUrl().then(url => {
    return url.toLowerCase();
  });
};

const currentUrlMatches = (expectedUrl: string) => {
  return () => browser.getCurrentUrl().then(currentUrl => expectedUrl.toLowerCase() === currentUrl.toLowerCase());
};

const isEmptyFileList = (fileList: ElementArrayFinder) => {
  return () => {
    return fileList.count().then(count => {
      return count === 0;
    });
  };
};

describe('Create Page for Demo', () => {
  let page: CreatePage;
  let searchPage: SearchPage;

  const getExpectedChildrenLabels = function() {
    const childrenList = require('../mocks/data-api/child-type-parent-type-Parent1-list.json');
    let childrenLabels = '';
    for (let i = 0; i < childrenList.content.length; i++) {
      childrenLabels = childrenLabels.concat(childrenList.content[i].data.label).concat('\n');
    }
    return childrenLabels;
  };

  const enterDateAndVerifyErrorMsg = function(date: string) {
    page.dateInputField.first().sendKeys(date);
    page.dateInputField.first().sendKeys(protractor.Key.TAB);

    browser.wait(protractor.ExpectedConditions.visibilityOf(page.metadataErrorMessages.first()), 10000);
    const invalidDateErrMsg = 'The year must be a valid date between 1654 and 2285';
    expect(page.metadataErrorMessages.first().getText()).toEqual(invalidDateErrMsg);
    expect(page.saveButton.isEnabled()).toBeFalsy();

    page.clickCancelButton();
    page.clickAcceptAlert();
  };

  beforeEach(() => {
    page = new CreatePage();
    searchPage = new SearchPage();
    page.navigateTo();
  });

  it('should have no accessibility violations', () => {
    const app = new ContentServicesUiPage();
    app.runAccessibilityChecks();
  });

  it('should display page title that matches config file', () => {
    expect(page.getPageTitle()).toEqual(demoConfig.pages.create.pageName);
  });

  it('should navigate to Search page when Cancel button is clicked', () => {
    page.clickCancelButton();
    page.clickAcceptAlert();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should navigate to Search page when Return to Results button is clicked', () => {
    page.clickReturnToResultsButton();
    page.clickAcceptAlert();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should navigate to Search page when App Name link is clicked', () => {
    page.clickAppName();
    page.clickAcceptAlert();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should display pdf viewer when 1 pdf file is uploaded with Add File button', () => {
    page.addFile(pdfFilePath);

    expect(page.pdfViewer.isDisplayed());
  });

  it('should display pdf viewer when 1 pdf file is uploaded with Choose Files button', () => {
    page.chooseFile(pdfFilePath);

    expect(page.pdfViewer.isDisplayed());
  });

  it('should display the list of files uploaded when multiple files are uploaded', () => {
    page.chooseFile(pdfFilePath + '\n' + docFilePath);

    expect(page.fileList.count()).toEqual(2);

    const pdfFileName = path.parse(pdfFilePath).base;
    const docFileName = path.parse(docFilePath).base;
    expect(page.getFileName(0)).toEqual(pdfFileName);
    expect(page.getFileName(1)).toEqual(docFileName);
  });

  it('should display default message when non viewable file is uploaded', () => {
    page.chooseFile(docFilePath);

    expect(page.getContentViewerText()).toEqual('Unable to display Content Preview.');
  });

  it('should redisplay file upload panel when uploaded file is removed', () => {
    page.chooseFile(pdfFilePath);
    page.clearButton.click();

    expect(page.uploadFilePanel.isDisplayed());

    page.clickCancelButton();
    page.clickAcceptAlert();
  });

  it('should replace the correct file when 1 of many files is replaced', () => {
    page.chooseFile(pdfFilePath + '\n' + docFilePath);
    page.saveButton.click();
    expect(until.alertIsPresent()).toBeTruthy();

    page.replaceFile(1, textFilePath);
    browser.waitForAngularEnabled(false);
    expect(page.getFileName(1)).toEqual(path.parse(textFilePath).base);
    browser.waitForAngularEnabled(true);

    page.clickCancelButton();
    page.clickAcceptAlert();
  });

  it("should display Upload Another checkbox that is checked by default if setting 'uploadAnoter'=true", () => {
    expect(page.uploadAnotherCheckbox.isDisplayed());
    expect(page.uploadAnotherCheckbox.isSelected());
  });

  it('should clear uploaded files list after saving if upload another checkbox is checked', () => {
    page.addFile(pdfFilePath);
    expect(page.fileList.count()).toEqual(1);

    page.clickSaveButton();
    browser.wait(isEmptyFileList(page.fileList), 2000);
    expect(page.fileList.count()).toEqual(0);
  });

  it('should autocomplete Student Name when Student ID is entered in Student input field', () => {
    const studentData = require('../mocks/data-api/student-query.json');
    const testStudentId = studentData.content[0].studentNumber;
    const studentName = studentData.content[0].displayName;

    page.studentInput.sendKeys(testStudentId);
    expect(searchPage.autoCompletePanel.isDisplayed());
    expect(searchPage.autoCompletedOption.getText()).toEqual(studentName);

    searchPage.autoCompletedOption.click();
    expect(page.getStudentValue()).toEqual(studentName);

    page.clickCancelButton();
    page.clickAcceptAlert();
  });

  it('should indicate focus on all form fields when selected', () => {
    page.formFields.each(field => {
      field.click();

      expect(field.getAttribute('className')).toContain('mat-focused');

      // reset for next field
      browser
        .actions()
        .sendKeys(protractor.Key.ESCAPE)
        .perform();
    });
  });

  it('should autocomplete Employee Name when Employee ID is entered in Employee input field', () => {
    const employeeData = require('../mocks/data-api/person-query.json');
    const employeeFirstName = employeeData.content[0].RegisteredFirstMiddleName;
    const employeeLastName = employeeData.content[0].RegisteredSurname;
    const employeeId = employeeData.content[0].PersonAffiliations.EmployeePersonAffiliation.EmployeeID;
    const employee = `${employeeLastName}, ${employeeFirstName} (${employeeId})`;

    page.personInput.sendKeys(employeeId);
    expect(searchPage.autoCompletePanel.isDisplayed());
    expect(searchPage.autoCompletedOption.getText()).toEqual(employee);

    searchPage.autoCompletedOption.click();
    expect(page.getPersonValue()).toEqual(employee);

    page.clickCancelButton();
    page.clickAcceptAlert();
  });

  it('should display child list dynamically when parent list is selected', () => {
    page.clickDropDownByLabel('DataApiOption parent');

    const parentList = require('../mocks/data-api/parent-type-list.json');
    page.clickDropDownOptionValueByText(parentList.content[0].data.label);

    page.clickDropDownByLabel('DataApiOption child');

    expect(page.selectPanel.getText()).toEqual(getExpectedChildrenLabels().trim());

    const childList1 = getExpectedChildrenLabels().split('\n')[0];
    page.clickDropDownOptionValueByText(childList1);

    page.clickReturnToResultsButton();
    page.clickAcceptAlert();
  });

  it('should clear Employee value when value is not selected from auto complete and Save button is clicked', () => {
    page.addFile(pdfFilePath);
    page.personInput.sendKeys('my employee');
    page.saveButton.click();

    expect(page.getPersonValue()).toEqual('');
  });

  it('should clear Student value when value is not selected from auto complete and user tabs out of the field', () => {
    page.studentInput.sendKeys('my student');
    page.studentInput.sendKeys(protractor.Key.TAB);

    expect(page.getStudentValue()).toEqual('');
  });

  it('should display alert when metadata is entered and browser is refreshed without saving', () => {
    page.inputField.sendKeys('any text');
    browser.driver.navigate().refresh();

    page.clickAcceptAlert();
  });

  it('should display error message and disable Save button when date text input is less than 1654', () => {
    enterDateAndVerifyErrorMsg('12/31/1653');
  });

  it('should display error message and disable Save button when date text input is greater than 2285', () => {
    enterDateAndVerifyErrorMsg('1/1/2286');
  });

  it('should disable calendar picker less than 1654', () => {
    page.dateInputField.first().sendKeys('1/1/1653');
    page.datePickerCalenderButton.click();
    page.calendarPeriodButton.click();

    expect(page.calendarDisabledSelections.count()).toBeGreaterThan(0);
    page.calendarDisabledSelections.each(calendarYear => {
      expect(calendarYear.getText()).toBeLessThan(1654);
    });

    page.calendarDisabledSelections.first().sendKeys(protractor.Key.ESCAPE);
    page.clickCancelButton();
    page.clickAcceptAlert();
  });

  it('should disable calendar picker greater than 2285', () => {
    page.dateInputField.first().sendKeys('1/1/2285');
    page.datePickerCalenderButton.click();
    page.calendarPeriodButton.click();

    expect(page.calendarDisabledSelections.count()).toBeGreaterThan(0);
    page.calendarDisabledSelections.each(calendarYear => {
      expect(calendarYear.getText()).toBeGreaterThan(2285);
    });

    page.calendarDisabledSelections.first().sendKeys(protractor.Key.ESCAPE);
    page.clickCancelButton();
    page.clickAcceptAlert();
  });

  it('should display the default number of entries for Course Year', () => {
    const getExpectedYears = function() {
      let year = new Date().getFullYear();
      let years = year.toString();
      const defaultYearEntries = 10;
      for (let i = 0; i < defaultYearEntries - 1; i++) {
        year = year - 1;
        years = years.concat('\n').concat(year.toString());
      }
      return years;
    };

    page.clickDropDownByLabel('Year');

    expect(page.selectPanel.getText()).toEqual(getExpectedYears());
  });

  it('should display Year, Quarter, Course, and Section fields for course-input component', () => {
    expect(page.getFormFieldByLabel('Year').isDisplayed()).toBeTruthy();
    expect(page.getFormFieldByLabel('Quarter').isDisplayed()).toBeTruthy();
    expect(page.getFormFieldByLabel('Course').isDisplayed()).toBeTruthy();
    expect(page.getFormFieldByLabel('Section').isDisplayed()).toBeTruthy();
  });
});

describe('Create Page for Demo2', () => {
  let page: CreatePage;
  let searchPage: SearchPage;

  beforeEach(() => {
    page = new CreatePage('demo2');
    searchPage = new SearchPage('demo2');
    page.navigateTo();
  });

  it('should have no accessibility violations', () => {
    const app = new ContentServicesUiPage();
    app.runAccessibilityChecks();
  });

  it('should disable Save button when required field is not populated', () => {
    expect(page.saveButton.isEnabled()).toBe(false);
  });

  it('should re-enable Save button when required fields are populated and file is uploaded', () => {
    page.populateRequiredFields(false);
    page.addFile(pdfFilePath);

    expect(page.saveButton.isEnabled()).toBe(true);

    page.clickCancelButton();
    page.clickAcceptAlert();
  });

  it('should disable Save button when required fields are populated but file is not uploaded', () => {
    page.populateRequiredFields(false);

    expect(page.saveButton.isEnabled()).toBe(false);

    page.clickCancelButton();
    page.clickAcceptAlert();
  });

  it('should display red error message when required field is not populated', () => {
    page.populateRequiredFields(true);

    page.metadataErrorMessages.each(errMsg => {
      expect(errMsg.getText()).not.toEqual('');

      const red = 'rgba(244, 67, 54, 1)';
      expect(errMsg.getCssValue('color')).toEqual(red);
    });
  });

  it('should have aria-required set to true for all required fields', () => {
    page.requiredFields.each(requiredField => {
      expect(requiredField.getAttribute('aria-required')).toEqual(
        'true',
        'aria-required not set to true for ' + requiredField.getTagName().then(tagName => tagName)
      );
    });
  });

  it("should display Upload Another checkbox that is un-checked by default if setting 'uploadAnoter'=false", () => {
    expect(page.uploadAnotherCheckbox.isDisplayed());
    expect(page.uploadAnotherCheckbox.isSelected()).toBeFalsy();
  });

  it('should redirect to search page after saving if upload another checkbox is un-checked', () => {
    page.populateRequiredFields(false);

    page.addFile(pdfFilePath);
    expect(page.fileList.count()).toEqual(1);

    page.clickSaveButton();
    browser.wait(currentUrlMatches(searchPage.pageUrl), 2000);
  });
});
