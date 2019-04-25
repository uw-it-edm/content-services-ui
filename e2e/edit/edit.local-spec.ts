import { EditPage } from './edit.po';
import { browser, ExpectedConditions } from 'protractor';
import { SearchPage } from '../search/search.po';
import { ContentServicesUiPage } from '../app/app.po';
import { until } from 'selenium-webdriver';
import { protractor } from 'protractor/built/ptor';

const getCurrentUrl = function() {
  return browser.getCurrentUrl().then(url => {
    return url.toLowerCase();
  });
};

describe('Edit Page', () => {
  const page = new EditPage();
  const demoConfig = require('../mocks/profile-api/demo.json');
  const searchPage = new SearchPage();

  const getExpectedChildrenLabels = function() {
    const childrenList = require('../mocks/data-api/child-type-parent-type-Parent1-list.json');
    let childrenLabels = '';
    for (let i = 0; i < childrenList.content.length; i++) {
      childrenLabels = childrenLabels.concat(childrenList.content[i].data.label).concat('\n');
    }
    return childrenLabels;
  };

  beforeEach(() => {
    page.navigateTo();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(demoConfig.pages.edit.pageName);
  });

  it('should display pdf viewer when file is replaced with pdf file', () => {
    page.replaceFile();
    page.saveButton.click();

    expect(until.alertIsPresent()).toBeTruthy();
    expect(page.getPdfViewer().isDisplayed()).toBeTruthy();
  });

  it('should display date field in correct format', () => {
    expect(page.getDateText()).toEqual('2/20/2018');
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

  it('should display download button for text file', () => {
    page.navigateTo('item-txt');
    browser.wait(ExpectedConditions.titleIs(demoConfig.pages.edit.pageName));

    expect(page.downloadButton.isEnabled()).toBeTruthy();
  });

  it('should display pdf viewer with download button for web viewable eml file', () => {
    page.navigateTo('item-eml');
    browser.wait(ExpectedConditions.titleIs(demoConfig.pages.edit.pageName));

    expect(page.getPdfViewer().isDisplayed()).toBeTruthy();
    expect(page.pdfViewerDownloadButton.isEnabled()).toBeTruthy();
  });

  it('should display pdf viewer with download button for pdf file', () => {
    expect(page.getPdfViewer().isDisplayed()).toBeTruthy();
    expect(page.pdfViewerDownloadButton.isEnabled()).toBeTruthy();
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

  it('should display Employee name in correct format', () => {
    const employeeData = require('../mocks/data-api/person.json');
    const itemData = require('../mocks/content-api/item.json');
    const employeeID = employeeData.PersonAffiliations.EmployeePersonAffiliation.EmployeeID;
    let employee = `${employeeData.RegisteredSurname}, ${employeeData.RegisteredFirstMiddleName} (${employeeID})`;

    employee = employee.replace('__RegId__', itemData.metadata.RegId);

    expect(page.getPersonText()).toEqual(employee);
  });

  it('should display child list dynamically when parent list is selected', () => {
    page.clickDropDownByLabel('DataApiOption parent');

    const parentList = require('../mocks/data-api/parent-type-list.json');
    page.clickDropDownOptionValueByText(parentList.content[0].data.label);

    page.clickDropDownByLabel('DataApiOption child');

    expect(page.selectPanel.getText()).toEqual(getExpectedChildrenLabels().trim());
  });
});
