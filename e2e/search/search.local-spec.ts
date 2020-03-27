///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import { SearchPage } from './search.po';
import { CreatePage } from '../create/create.po';
import { ContentServicesUiPage } from '../app/app.po';
import { DisplaySearchPage } from './display-search.po';
import { browser, protractor } from 'protractor';
import * as moment from 'moment-timezone';
import { EditPage } from '../edit/edit.po';

let page: SearchPage;

describe('Search Page', () => {
  const demoConfig = require('../mocks/profile-api/demo.json');
  const demo2Config = require('../mocks/profile-api/demo2.json');
  const demo3Config = require('../mocks/profile-api/demo3.json');
  const searchData = require('../mocks/search-api/search.json');

  const selectAndVerifyDateRange = function(dateRangeText = 'Today') {
    const getExpectedDateRange = function(range: string = 'Today'): string {
      let startDate;
      let endDate;

      switch (range) {
        case 'Today':
          startDate = moment();
          endDate = startDate;
          break;
        case 'Yesterday':
          startDate = moment().subtract(1, 'days');
          endDate = startDate;
          break;
        case 'Last 7 Days':
          startDate = moment().subtract(6, 'days');
          endDate = moment();
          break;
        case 'Last 30 Days':
          startDate = moment().subtract(29, 'days');
          endDate = moment();
          break;
        case 'This Month':
          startDate = moment().startOf('month');
          endDate = moment().endOf('month');
          break;
        case 'Last Month':
          startDate = moment()
            .subtract(1, 'month')
            .startOf('month');
          endDate = moment()
            .subtract(1, 'month')
            .endOf('month');
          break;
      }

      startDate = startDate.format('YYYY-MM-DD');
      endDate = endDate.format('YYYY-MM-DD');
      return `Last Modified Date: \\[${startDate} TO ${endDate}\\]`;
    };

    page.dateRangeInput.click();
    page.getButtonByText(dateRangeText).click();

    expect(page.dateRangePicker.isDisplayed()).toBeFalsy();
    expect(page.selectedFacet.getText()).toMatch(getExpectedDateRange(dateRangeText));
    expect(page.getDateRangeInputText()).toEqual(dateRangeText);
  };

  beforeEach(() => {
    page = new SearchPage();
    page.navigateTo();
  });

  it('should have no accessibility violations', () => {
    const app = new ContentServicesUiPage();
    app.runAccessibilityChecks();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(demoConfig.pages['tab-search'].pageName);
  });

  it('should display app name in banner title', () => {
    expect(page.getHeaderToolbarText()).toEqual(demoConfig.appName);
  });

  it('should accept text input in searchbox and retains the value', () => {
    const searchText = 'this is a sample test';
    page.searchBox.sendKeys(searchText);
    expect(page.getSearchBoxInputText()).toEqual(searchText);
  });

  it('should clear search text when Clear Search button is clicked', () => {
    page.searchBox.sendKeys('my search text');
    expect(page.clearSearchBoxButton.isDisplayed).toBeTruthy();

    page.clearSearchBoxButton.click();
    expect(page.getSearchBoxInputText()).toEqual('');
  });

  it('should not clear filters when Clear Search button is clicked', () => {
    page.clickFacetLink(0);
    page.searchBox.sendKeys('my search text');
    page.clearSearchBoxButton.click();

    expect(page.selectedFacet.isDisplayed).toBeTruthy();
  });

  it('should display 2 page paginators', () => {
    expect(page.getPaginators().count()).toEqual(2);
  });

  it('should display Id column with descending sort arrow by default', () => {
    expect(page.isSortIndicatorDesc);
  });

  it('should autocomplete Student Name when Student ID is entered in search box', () => {
    const studentData = require('../mocks/data-api/student-query.json');
    const testStudentId = studentData.content[0].studentNumber;

    page.searchBox.sendKeys(testStudentId);
    expect(page.autoCompletePanel.isDisplayed()).toBeTruthy();
    expect(page.autoCompletedOption.getText()).toEqual(studentData.content[0].displayName);

    page.autoCompletedOption.click();
    expect(page.selectedFacet.isDisplayed()).toBeTruthy();
    expect(page.selectedFacet.getText()).toMatch(new RegExp(testStudentId));
  });

  it('should navigate to Upload page when upload button is clicked', () => {
    page.clickUploadButton();

    const actualUrl = browser.getCurrentUrl().then(url => {
      return url.toLowerCase();
    });

    let createPage: CreatePage;
    createPage = new CreatePage();
    expect(actualUrl).toMatch(createPage.pageUrl.toLowerCase());
  });

  it('should produce sharable search parameters in url when search is performed', () => {
    const expectedFacetText = 'Type 1';
    page.clickFacetLink(0);
    expect(page.selectedFacet.getText()).toMatch(new RegExp(expectedFacetText));

    // Open sharable url in another browser
    browser.getCurrentUrl().then(sharableUrl => {
      browser.restart().then(() => {
        browser.get(sharableUrl);
        const page2: SearchPage = new SearchPage();
        expect(page2.selectedFacet.getText()).toMatch(new RegExp(expectedFacetText));
      });
    });
  });

  it('should clear date range text when date filter is removed', () => {
    selectAndVerifyDateRange('Today');
    page.removeSelectedFacet();

    expect(page.getDateRangeInputText()).toEqual('');
  });

  it('should display correct date range in search filter when Yesterday is selected', () => {
    selectAndVerifyDateRange('Yesterday');
  });

  it('should display correct date range in search filter when Last 7 Days is selected', () => {
    selectAndVerifyDateRange('Last 7 Days');
  });

  it('should display correct date range in search filter when Last 30 Days is selected', () => {
    selectAndVerifyDateRange('Last 30 Days');
  });

  it('should display correct date range in search filter when This Month is selected', () => {
    selectAndVerifyDateRange('This Month');
  });

  it('should display correct date range in search filter when Last Month is selected', () => {
    selectAndVerifyDateRange('Last Month');
  });

  it('should navigate to display-search page when Display All button is clicked', () => {
    page.displayAllButton.click();

    const displaySearchPage = new DisplaySearchPage();
    expect(browser.getCurrentUrl()).toEqual(displaySearchPage.getEncodedPageUrl());
  });

  it('should autocomplete Employee Name when Employee ID is entered in search box', () => {
    page = new SearchPage('demo2');
    page.navigateTo();

    const employeeData = require('../mocks/data-api/person-query.json');
    const employeeId = employeeData.content[0].PersonAffiliations.EmployeePersonAffiliation.EmployeeID;
    const employeeFirstName = employeeData.content[0].RegisteredFirstMiddleName;
    const employeeLastName = employeeData.content[0].RegisteredSurname;
    const employee = `${employeeLastName}, ${employeeFirstName} (${employeeId})`;

    page.searchBox.sendKeys(employeeId);
    expect(page.autoCompletePanel.isDisplayed());
    expect(page.autoCompletedOption.getText()).toEqual(employee);

    page.autoCompletedOption.click();
    expect(page.selectedFacet.isDisplayed());
    expect(page.selectedFacet.getText()).toMatch(new RegExp(employeeId));
  });

  it('should display more DocumentType facet values when "more" is clicked', () => {
    page.moreButton.click();
    expect(page.lessButton.isDisplayed()).toBeTruthy();

    const facetSize = demoConfig.pages['tab-search'].facetsConfig.facets['metadata.DocumentType.label.raw'].size;
    expect(page.getFacetItemLinks(0).count()).toBeGreaterThan(facetSize);
  });

  it('should display less DocumentType facet values when "less" is clicked', () => {
    page.moreButton.click();
    expect(page.lessButton.isDisplayed()).toBeTruthy();

    page.lessButton.click();
    expect(page.moreButton.isDisplayed()).toBeTruthy();

    const facetSize = demoConfig.pages['tab-search'].facetsConfig.facets['metadata.DocumentType.label.raw'].size;
    expect(page.getFacetItemLinks(0).count()).toEqual(facetSize);
  });

  it('should display Search button with configurable label', () => {
    const searchButtonCustomizedText = demoConfig.customText['searchBox.search'].label;
    expect(page.searchButton.getText()).toEqual(searchButtonCustomizedText);
  });

  it('should display Person field in the right format', () => {
    page = new SearchPage('demo2');
    page.navigateTo();

    const employeeData = require('../mocks/data-api/person.json');
    const itemData = require('../mocks/content-api/item.json');
    const employeeID = employeeData.PersonAffiliations.EmployeePersonAffiliation.EmployeeID;
    let employee = `${employeeData.RegisteredSurname}, ${employeeData.RegisteredFirstMiddleName} (${employeeID})`;

    employee = employee.replace('__RegId__', itemData.metadata.RegId);

    expect(page.getResultsByColumn('RegId')).toContain(employee);
  });

  it('should display boolean facets value with configurable label', () => {
    const booleanCustomizedText0 = demoConfig.customText['facet.metadata.mybooleanfield.0'].label;
    const booleanCustomizedText1 = demoConfig.customText['facet.metadata.mybooleanfield.1'].label;

    page
      .getFacetItemLinks(3)
      .getText()
      .then(actualBooleanLabels => {
        const booleanLabels = actualBooleanLabels.toString().split(',');
        expect(booleanLabels[0]).toContain(booleanCustomizedText0);
        expect(booleanLabels[1]).toContain(booleanCustomizedText1);
      });
  });

  it('should display a different color on the search results row when moused over', () => {
    const originalBackgroundColor = page.getBackgroundColor(page.searchResultsRows.get(0));

    page.mouseOver(page.searchResultsRows.first());
    expect(page.getBackgroundColor(page.searchResultsRows.first())).not.toEqual(originalBackgroundColor);
  });

  it('should display a different color on the facets row when moused over', () => {
    const originalBackgroundColor = page.getBackgroundColor(page.getFacetItems(0, 0));

    page.mouseOver(page.getFacetItems(0, 0));
    expect(page.getBackgroundColor(page.getFacetItems(0, 0))).not.toEqual(originalBackgroundColor);
  });

  it('should display a different color on the facets row when tabbed on', () => {
    const originalBackgroundColor = page.getBackgroundColor(page.getFacetItems(0, 0));

    page.dateRangeInput.sendKeys(protractor.Key.TAB);
    expect(page.getBackgroundColor(page.getFacetItems(0, 0))).not.toEqual(originalBackgroundColor);
  });

  it('should navigate to Edit page when search results row is clicked on', () => {
    page.searchResultsRows.first().click();

    const itemId = searchData.searchResults[0].id;
    const editPage = new EditPage('demo', itemId);
    expect(browser.getCurrentUrl()).toContain(editPage.pageUrl);
  });

  it('should display the label for data-api sourced results', () => {
    const dataApiColumnKey = 'childType';
    const searchResultsDataApiKey = searchData.searchResults[0].metadata[`${dataApiColumnKey}`];
    const dataApiFileName = `child-type-${searchResultsDataApiKey}-get.json`;
    const dataApiData = require('../mocks/data-api/' + dataApiFileName);

    expect(page.getResultsByColumn(dataApiColumnKey)).toContain(dataApiData.data.label);
  });

  it('should display the label for data-api sourced facets', () => {
    const dataApiColumnKey = 'childType';
    const searchResultsDataApiKey = searchData.searchResults[0].metadata[`${dataApiColumnKey}`];
    const dataApiFileName = `child-type-${searchResultsDataApiKey}-get.json`;
    const dataApiData = require('../mocks/data-api/' + dataApiFileName);

    const expectedFacetLabel = dataApiData.data.label;
    expect(expectedFacetLabel.length).not.toEqual(0, 'Facets label is not configured in data-api mock.');
    expect(page.getFacetItemLinksTexts(5)).toMatch(expectedFacetLabel);
  });

  it('should display results column with fixed padding', () => {
    const expectedPaddingSize = '10px';
    page.getResultColumnsPaddingSizes().then(paddingSizes => {
      for (const size of paddingSizes) {
        expect(size).toEqual(expectedPaddingSize);
      }
    });
  });

  it('should reset paging and retain page size when search button is clicked', () => {
    page.paginatorSizeDropDowns.get(0).click();
    const selectedSize = 10;
    page.clickPaginatorSizeOption(selectedSize.toString());
    expect(page.paginatorSizeDropDowns.get(0).getText()).toEqual(selectedSize.toString());

    page.paginatorNextButtons.get(0).click();
    const totalResults = searchData.totalCount;
    const newStartPage = selectedSize + 1;
    const newEndPage = selectedSize * 2;
    let expectedPaginatorText = `${newStartPage} - ${newEndPage} of ${totalResults}`;
    expect(page.paginatorCounts.get(0).getText()).toEqual(expectedPaginatorText);

    page.searchButton.click();

    expect(page.paginatorSizeDropDowns.get(0).getText()).toEqual(selectedSize.toString());
    expectedPaginatorText = `1 - ${selectedSize} of ${totalResults}`;
    expect(page.paginatorCounts.get(0).getText()).toEqual(expectedPaginatorText);
  });

  it('should update the accessibility live announcer when columns are sorted', () => {
    // when the page loads, the default sorting will take place.
    page.waitForLiveAnnouncerText('Sort by id, descending.');

    page.sortByHeaderText('Publish Status');
    page.waitForLiveAnnouncerText('Sort by Publish Status, ascending.');

    page.sortByHeaderText('Publish Status');
    page.waitForLiveAnnouncerText('Sort by Publish Status, descending.');

    // Clicking on the same column for a third time will clear sorting and remove it from announcer.
    page.sortByHeaderText('Publish Status');
    page.waitForLiveAnnouncerText('Search results updated. Showing items 1 to 50');
  });

  it('should re-load table columns and reset search when switching tenants', () => {
    const app = new ContentServicesUiPage();

    // switch to 'demo3' profile.
    app.clickAppMenuIcon();
    app.clickAppMenuItem(2);

    page.waitForFirstRowValue('ProfileId', 'Demo3');
    expect(page.tableHeaders.getText()).toEqual(
      ['Id'].concat(demo3Config.pages['tab-search'].fieldsToDisplay.map(i => i.label))
    );

    // Click on facet and paginator.
    page.clickFacetLink(0);
    page.paginatorNextButtons.get(0).click();

    // switch to 'demo2' profile and verify table resets columns.
    app.clickAppMenuIcon();
    app.clickAppMenuItem(1);

    page.waitForFirstRowValue('ProfileId', 'Demo');
    expect(page.tableHeaders.getText()).toEqual(
      ['Id'].concat(demo2Config.pages['tab-search'].fieldsToDisplay.map(i => i.label))
    );

    // verify facets and paginator got cleared.
    expect(page.selectedFacet.getText()).toEqual([]);
    expect(page.paginatorCounts.get(0).getText()).toContain('1 - ');
  });

  it('should toggle visibility of facets panel when clicking the hide/show button', () => {
    page.waitForFirstRowValue('ProfileId', 'Demo');

    // Verify the facets are visible on page load.
    expect(page.getFacet(0).isDisplayed()).toBeTruthy();

    // Verify clicking button hides the facets panel.
    page.toggleFacetsPanelButton.click();
    page.waitForLiveAnnouncerText('Filter panel hidden.');
    expect(page.getFacet(0).isDisplayed()).toBeFalsy();

    // Verify clicking button again shows the facets panel.
    page.toggleFacetsPanelButton.click();
    page.waitForLiveAnnouncerText('Filter panel shown.');
    expect(page.getFacet(0).isDisplayed()).toBeTruthy();
  });

  it('should keep facets panel collapsed after changing profiles', () => {
    const app = new ContentServicesUiPage();
    page.waitForFirstRowValue('ProfileId', 'Demo');

    // Hide facets panel.
    page.toggleFacetsPanelButton.click();
    page.waitForLiveAnnouncerText('Filter panel hidden.');
    expect(page.getFacet(0).isDisplayed()).toBeFalsy();

    // Switch to 'demo3' profile.
    app.clickAppMenuIcon();
    app.clickAppMenuItem(2);
    page.waitForFirstRowValue('ProfileId', 'Demo3');

    // Verify facets panel is still collapsed.
    expect(page.getFacet(0).isDisplayed()).toBeFalsy();
  });

  it('should keep facets panel collapsed after navigating back from upload/edit page', () => {
    const createPage = new CreatePage();
    page.waitForFirstRowValue('ProfileId', 'Demo');

    // Hide facets panel.
    page.toggleFacetsPanelButton.click();
    page.waitForLiveAnnouncerText('Filter panel hidden.');
    expect(page.getFacet(0).isDisplayed()).toBeFalsy();

    // Click on 'Upload' button to go upload page.
    page.clickUploadButton();
    expect(browser.getCurrentUrl().then(url => url.toLowerCase())).toBe(createPage.pageUrl.toLowerCase());

    // Click on 'Back' button return to search page.
    createPage.clickReturnToResultsButton();
    page.clickAcceptAlert();
    page.waitForFirstRowValue('ProfileId', 'Demo');

    // Verify facets panel is still collapsed.
    expect(page.getFacet(0).isDisplayed()).toBeFalsy();
  });

  it('should auto-collapse facets panel when switching profiles that do not have any configured', () => {
    const app = new ContentServicesUiPage();
    page.waitForFirstRowValue('ProfileId', 'Demo');

    // Switch to 'demo4' profile (which has no facets)
    app.clickAppMenuIcon();
    app.clickAppMenuItem(3);
    page.waitForFirstRowValue('ProfileId', 'Demo4');

    // Verify facets panel is collapsed and button is hidden
    expect(page.facetsElement.isPresent()).toBeFalsy();
    expect(page.toggleFacetsPanelButton.isDisplayed()).toBeFalsy();

    // Switch to 'demo' profile
    app.clickAppMenuIcon();
    app.clickAppMenuItem(0);
    page.waitForFirstRowValue('ProfileId', 'Demo');

    // Verify facets panel is expanded and button is shown
    expect(page.facetsElement.isPresent()).toBeTruthy();
    expect(page.toggleFacetsPanelButton.isDisplayed()).toBeTruthy();
  });
});
