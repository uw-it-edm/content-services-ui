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

describe('Edit Page for Demo', () => {
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

  it('should have no accessibility violations', () => {
    const app = new ContentServicesUiPage();
    app.runAccessibilityChecks();
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
    page.saveButton.click();
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

    page.clickDropDownOptionValueByText(getExpectedChildrenLabels().split('\n')[0]);
    page.saveButton.click();
  });

  it('should display customized error message on save if custom message is configured', () => {
    const editPageForBadItemWithCustomMsg = new EditPage('demo', 'unauthorized-updatedid');
    editPageForBadItemWithCustomMsg.navigateTo();

    editPageForBadItemWithCustomMsg.inputField.sendKeys('any text');
    editPageForBadItemWithCustomMsg.saveButton.click();

    const customizedErrMsgLabel = demoConfig.customText['error.content.update.403'].label;
    expect(customizedErrMsgLabel.length).not.toEqual(0, 'Custom error message is not configured in demo profile.');
    const expectedCustomizedMsg = `Failed to save 1 item\n${customizedErrMsgLabel}\nDismiss`;
    expect(editPageForBadItemWithCustomMsg.getSnackBarText()).toEqual(expectedCustomizedMsg);

    page.clickReturnToResultsLink();
    page.clickAcceptAlert();
  });

  it('should display default error message on save if custom message is not configured', () => {
    const editPageForBadItemWithoutCustomMsg = new EditPage('demo2', 'unauthorized-updatedid');
    editPageForBadItemWithoutCustomMsg.navigateTo();

    editPageForBadItemWithoutCustomMsg.inputField.sendKeys('any text');
    editPageForBadItemWithoutCustomMsg.saveButton.click();

    expect(editPageForBadItemWithoutCustomMsg.getSnackBarText()).toEqual('Failed to save 1 item\nDismiss');

    page.clickReturnToResultsLink();
    page.clickAcceptAlert();
  });

  it('should display dates that are before 1970', () => {
    page.navigateTo('item-old-date');
    browser.wait(ExpectedConditions.titleIs(demoConfig.pages.edit.pageName));

    expect(page.getDateText()).toEqual('12/31/1969');
  });

  it('should display alert when metadata is edited and browser back button is hit without saving', () => {
    page.inputField.sendKeys('any text');
    browser.navigate().back();

    page.clickAcceptAlert();
  });

  it('should display alert when metadata is edited and Next button is hit without saving', () => {
    searchPage.navigateTo();
    searchPage.searchResultsRows.first().click();

    const searchData = require('../mocks/search-api/search.json');
    const itemId = searchData.searchResults[0].id;
    const editPage = new EditPage('demo', itemId);
    expect(browser.getCurrentUrl()).toContain(editPage.pageUrl);

    editPage.dateInputField.get(0).sendKeys('1/1/2020');
    editPage.nextItemButton.click();

    editPage.clickAcceptAlert();
  });

  it('should enable Save button when Course is updated', () => {
    page.clickDropDownByLabel('Course');
    page.clickDropDownOptionValueByText('103-PHY SCI INQUIRY I');

    expect(page.saveButton.isEnabled()).toBeTruthy();
  });
});

describe('Edit Page for Demo2', () => {
  const page = new EditPage('demo2', '123');
  const searchPage = new SearchPage('demo2');

  beforeEach(() => {
    page.navigateTo();
  });

  it('should have no accessibility violations', () => {
    const app = new ContentServicesUiPage();
    app.runAccessibilityChecks();
  });

  it('should not display alert when the page has disabled fields and no changes are made', () => {
    page.clickReturnToResultsLink();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should display alert when the page has disabled fields and metadata is updated without saving', () => {
    page.inputField.sendKeys('any text');
    browser.navigate().back();

    page.clickAcceptAlert();
  });
});

describe('Edit Page for Demo3', () => {
  const page = new EditPage('demo3', '123');

  beforeEach(() => {
    page.navigateTo();
  });

  it('should have no accessibility violations', () => {
    const app = new ContentServicesUiPage();
    app.runAccessibilityChecks();
  });

  it('should display lock icon for all disabled fields', () => {
    expect(page.lockIcons.count()).toEqual(9);
    page.lockIcons.each(lockIcon => {
      expect(lockIcon.getCssValue('color')).toEqual('rgba(0, 0, 0, 0.55)');
    });
  });

  it('should display all disabled field values in grey color', () => {
    page.disabledFields.each(disabledField => {
      expect(disabledField.getCssValue('color')).toEqual('rgba(0, 0, 0, 0.55)');
    });
  });
});
