///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import { SearchPage } from './search.po';
import { CreatePage } from '../create/create.po';
import { browser } from 'protractor';

describe('Search Page', () => {
  let page: SearchPage;
  const demoConfig = require('../mocks/profile-api/demo.json');

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
    page.searchBox().sendKeys(searchText);
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

    page.searchBox().sendKeys(testStudentId);
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
});
