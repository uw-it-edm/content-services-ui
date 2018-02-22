import {CreatePage} from './create.po';
import {SearchPage} from '../search/search.po';
import {browser} from 'protractor';
import * as path from 'path';
import {until} from 'selenium-webdriver';

const getCurrentUrl = function() {
  return browser.getCurrentUrl().then(url => {
    return url.toLowerCase();
  });
};

describe('Create Page', () => {
  let page: CreatePage;
  const searchPage = new SearchPage();
  const demoConfig = require('../mocks/profile-api/demo.json');
  const pdfFilePath = path.resolve(__dirname, '../mocks/files/sample-file.pdf');
  const docFilePath = path.resolve(__dirname, '../mocks/files/sample-file.docx');
  const textFilePath = path.resolve(__dirname, '../mocks/files/sample-file.txt');

  beforeEach(() => {
    page = new CreatePage();
    page.navigateTo();
  });

  it('should display page title that matches config file', () => {
    expect(page.getPageTitle()).toEqual(demoConfig.pages.create.pageName);
  });

  it('should navigate to Search page when Cancel button is clicked', () => {
    page.clickCancelButton();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should navigate to Search page when Return to Results button is clicked', () => {
    page.clickReturnToResultsButton();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should navigate to Search page when App Name link is clicked', () => {
    page.clickAppName();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should display pdf viewer when 1 pdf file is uploaded with Add File button', () => {
    page.addFile(pdfFilePath);

    expect(page.getPdfViewer().isDisplayed());
  });

  it('should display pdf viewer when 1 pdf file is uploaded with Choose Files button', () => {
    page.chooseFile(pdfFilePath);

    expect(page.getPdfViewer().isDisplayed());
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
    page.undoFile();

    expect(page.uploadFilePanel.isDisplayed());
  });

  it('should replace the correct file when 1 of many files is replaced', () => {
    page.chooseFile(pdfFilePath + '\n' + docFilePath);
    page.clickSave();
    expect(until.alertIsPresent()).toBeTruthy();

    page.replaceFile(1, textFilePath);
    browser.waitForAngularEnabled(false);
    expect(page.getFileName(1)).toEqual(path.parse(textFilePath).base);
    browser.waitForAngularEnabled(true);
  });

  it('should display error message when no file is attached', () => {
    page.inputField.sendKeys('any text');
    page.clickSave();

    expect(page.errorNotification.isDisplayed());
  });

  it('should display Upload Another checkbox that is checked by default', () => {
    expect(page.uploadAnotherCheckbox.isDisplayed());
    expect(page.uploadAnotherCheckbox.isSelected());
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
  });
});
