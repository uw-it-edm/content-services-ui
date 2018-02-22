import {EditPage} from './edit.po';
import {browser} from 'protractor';
import {SearchPage} from '../search/search.po';
import {ContentServicesUiPage} from '../app/app.po';
import {until} from 'selenium-webdriver';

const getCurrentUrl = function() {
  return browser.getCurrentUrl().then(url => {
    return url.toLowerCase();
  });
};

describe('Edit Page', () => {
  const page = new EditPage();
  const demoConfig = require('../mocks/profile-api/demo.json');
  const searchPage = new SearchPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(demoConfig.pages.edit.pageName);
  });

  it('should display pdf viewer with download button when file is replaced with pdf file', () => {
    page.replaceFile();
    page.saveButton.click();

    expect(until.alertIsPresent()).toBeTruthy();
    expect(page.getPdfViewer().isDisplayed()).toBeTruthy();
    expect(page.downloadButton.isEnabled()).toBeTruthy();
  });

  it('should display date field in correct format', () => {
    expect(page.getLastModifiedDateText()).toEqual('2/20/2018');
  });

  it('should display Student name in correct format', () => {
    const studentData = require('../mocks/data-api/student.json');
    const student = `${studentData.lastName}, ${studentData.firstName} (${studentData.studentNumber})`;

    expect(page.getStudentText()).toEqual(student);
  });

  it('should disable Save button by default', () => {
    expect(page.saveButton.isEnabled()).toBeFalsy();
  });

  it('should enable Save button when metadata is edited', () => {
    page.inputField.sendKeys('any text');

    expect(page.saveButton.isEnabled()).toBeTruthy();
  });

  it('should navigate to Search page when Return to Results link is clicked', () => {
    page.clickReturnToResultsLink();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should navigate to Search page when header App Name link is clicked', () => {
    const appPage = new ContentServicesUiPage();
    appPage.headerTitle.click();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });
});
