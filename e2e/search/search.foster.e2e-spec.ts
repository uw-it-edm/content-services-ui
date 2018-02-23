///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import {SearchPage} from './search.po';
import {ContentServicesUiPage} from '../app/app.po';
import {browser} from 'protractor';
import {until} from 'selenium-webdriver';
import {EditPage} from '../edit/edit.po';

describe('Foster Search Page', () => {
  const profile = 'foster';
  const page = new SearchPage(profile);
  const editPageTitle = 'View or Edit Document';
  const pageTitle = 'Find Documents';

  beforeEach(() => {
    page.navigateTo();
    browser.wait(until.titleIs(pageTitle));
  });

  it('should display Foster header', () => {
    const appPage = new ContentServicesUiPage();
    expect(appPage.getHeaderToolbarText()).toEqual('Foster Undergraduate Program');
  });

  it('should return selected facet in search results', () => {
    const facetIndex = 0;
    page.getFacetText(facetIndex).then(expectedFacetText => {
      expectedFacetText = expectedFacetText.split(' (')[0];

      page.clickFacetLink(facetIndex);

      expect(page.selectedFacet.isDisplayed());
      expect(page.selectedFacet.getText()).toMatch(new RegExp(expectedFacetText));
      expect(page.getDistinctResultsByColumn('Adviser')).toEqual([expectedFacetText]);
    });
  });

  it('should reset search results when selected facet is removed', () => {
    page.clickFacetLink(0);
    expect(page.selectedFacet.isDisplayed());

    page.removeSelectedFacet();
    expect(
      page.getDistinctResultsByColumn('Adviser').then(arr => {
        return arr.length;
      })
    ).toBeGreaterThanOrEqual(1);
  });

  it('should navigate to Edit page when Id link is clicked', () => {
    page.goToEditPage(profile, editPageTitle);
  });

  it('should retain search and sort criteria when returning from Edit page', () => {
    page.clickFacetLink(0); // Adviser
    page.clickFacetLink(1); // Form

    page.idColumHeaderButton.click();
    expect(page.isSortIndicatorDesc()).toBeFalsy();

    page.selectedFacet.getText().then(selectedFacetTexts => {
      page.goToEditPage(profile, editPageTitle);

      const editPage = new EditPage(profile);
      editPage.clickReturnToResultsLink();
      browser.wait(until.titleIs(pageTitle));

      expect(page.selectedFacet.getText()).toEqual(selectedFacetTexts);
      expect(page.isSortIndicatorDesc()).toBeFalsy();
    });
  });
});
