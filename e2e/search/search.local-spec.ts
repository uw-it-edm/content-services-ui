///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import { SearchPage } from './search.po';
import { CreatePage } from '../create/create.po';
import { DisplaySearchPage } from './display-search.po';
import { browser } from 'protractor';
import * as moment from 'moment-timezone';

let page: SearchPage;

describe('Search Page', () => {
  const demoConfig = require('../mocks/profile-api/demo.json');

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
    expect(page.autoCompletePanel.isDisplayed());
    expect(page.autoCompletedOption.getText()).toEqual(studentData.content[0].displayName);

    page.autoCompletedOption.click();
    expect(page.selectedFacet.isDisplayed());
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

  it('should display correct date range in search filter when Today is selected', () => {
    selectAndVerifyDateRange('Today');
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
    expect(page.getFacetItems(0).count()).toBeGreaterThan(facetSize);
  });

  it('should display less DocumentType facet values when "less" is clicked', () => {
    page.moreButton.click();
    expect(page.lessButton.isDisplayed()).toBeTruthy();

    page.lessButton.click();
    expect(page.moreButton.isDisplayed()).toBeTruthy();

    const facetSize = demoConfig.pages['tab-search'].facetsConfig.facets['metadata.DocumentType.label.raw'].size;
    expect(page.getFacetItems(0).count()).toEqual(facetSize);
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
      .getFacetItems(3)
      .getText()
      .then(actualBooleanLabels => {
        const booleanLabels = actualBooleanLabels.toString().split(',');
        expect(booleanLabels[0]).toContain(booleanCustomizedText0);
        expect(booleanLabels[1]).toContain(booleanCustomizedText1);
      });
  });
});
