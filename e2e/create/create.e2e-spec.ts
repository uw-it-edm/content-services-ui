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

describe('content-services-ui Create Page', () => {
  const page = new CreatePage();
  const searchPage = new SearchPage();
  const demoConfig = require('../mocks/profile-api/demo.json');
  const pdfFilePath = path.resolve(__dirname, '../sample-file.pdf');
  const docFilePath = path.resolve(__dirname, '../sample-file.docx');
  const textFilePath = path.resolve(__dirname, '../sample-file.txt');

  beforeEach(() => {
    page.navigateTo();
  });

  it('should display page title that matches config file', () => {
    expect(page.getPageTitle()).toEqual(demoConfig.pages.create.pageName);
  });

  it('should replace the correct file when 1 of many files is replaced', () => {
    const contentItem = require('../mocks/content-api/item.json');
    const textFileName = path.parse(textFilePath).base;

    page.chooseFile(pdfFilePath + '\n' + docFilePath);
    page.clickSave();
    expect(until.alertIsPresent());

    page.replaceFile(1, textFilePath);
    expect(page.getFileNames()).toEqual([contentItem.label, textFileName]);
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
    expect(page.getFileNames()).toEqual([pdfFileName.trim(), docFileName.trim()]);
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
});
