///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import {SearchPage} from './search.po';
import {ContentServicesUiPage} from '../app/app.po';
import {browser} from 'protractor';
import {until} from 'selenium-webdriver';

describe('Foster Search Page', () => {
  const profile = 'foster';
  const page = new SearchPage(profile);

  beforeEach(() => {
    page.navigateTo();
    browser.wait(until.titleIs('Find Documents'));
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
      expect(page.selectedFacet.getText()).toContain('Adviser: ' + expectedFacetText);
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
    page.goToEditPage(profile, 'View or Edit Document');
  });
});
