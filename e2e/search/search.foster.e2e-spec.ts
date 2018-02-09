///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import {SearchPage} from './search.po';
import {ContentServicesUiPage} from '../app/app.po';
import {browser} from 'protractor';
import {until} from 'selenium-webdriver';

describe('Foster Search Page', () => {
  let page: SearchPage;

  beforeEach(() => {
    page = new SearchPage('foster');
    page.navigateTo();
    browser.wait(until.titleIs('Find Documents'));
  });

  it('should display Foster header', () => {
    const appPage = new ContentServicesUiPage();
    expect(appPage.getHeaderToolbarText()).toEqual('Foster Undergraduate Program');
  });

  it('should return selected facet in search results', () => {
    const adviser = 'Aaron Robertson';
    page.clickFacetText(adviser);

    expect(page.selectedFacet.isDisplayed());
    expect(page.selectedFacet.getText()).toContain('Adviser: ' + adviser);
    expect(page.getDistinctResultsByColumn('Adviser')).toEqual([adviser]);
  });

  it('should reset search results when selected facet is removed', () => {
    const adviser = 'Aaron Robertson';
    page.clickFacetText(adviser);
    expect(page.selectedFacet.isDisplayed());

    page.removeSelectedFacet();
    expect(
      page.getDistinctResultsByColumn('Adviser').then(arr => {
        return arr.length;
      })
    ).toBeGreaterThan(1);
  });

  it('should autocomplete Student Name when Student ID is entered in search box', () => {
    page.searchBox().sendKeys(page.testStudentId);
    expect(page.autoCompletePanel.isDisplayed());
    expect(page.autoCompletedOption.getText()).toEqual(page.testStudentName);

    page.autoCompletedOption.click();
    expect(page.selectedFacet.isDisplayed());
    expect(page.selectedFacet.getText()).toContain('Student Number: ' + page.testStudentId);
  });
});
