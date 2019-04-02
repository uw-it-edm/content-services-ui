///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import { SearchPage } from './search.po';
import { browser, ExpectedConditions, protractor } from 'protractor';
import { EditPage } from '../edit/edit.po';

describe('Foster Search Page', () => {
  const profile = 'foster';
  const page = new SearchPage(profile);
  const editPageTitle = 'View or Edit Document';
  const pageTitle = 'Find Documents';

  beforeEach(() => {
    page.navigateTo();
    browser.wait(ExpectedConditions.titleIs(pageTitle));
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
      browser.wait(ExpectedConditions.titleIs(pageTitle));

      expect(page.selectedFacet.getText()).toEqual(selectedFacetTexts);
      expect(page.isSortIndicatorDesc()).toBeFalsy();
    });
  });

  it('should not change search results when search button is not clicked', () => {
    page.paginatorCounts
      .get(0)
      .getText()
      .then(paginatorCount => {
        page.searchBox.sendKeys('search for test documents');

        expect(page.paginatorCounts.get(0).getText()).toEqual(paginatorCount);
      });
  });

  it('should change search results when search button is clicked', () => {
    page.paginatorCounts
      .get(0)
      .getText()
      .then(paginatorCount => {
        page.searchBox.sendKeys('search for test documents');
        page.searchButton.click();

        expect(page.paginatorCounts.get(0).getText()).not.toEqual(paginatorCount);
      });
  });

  it('should change search results when Enter key is pressed', () => {
    page.paginatorCounts
      .get(0)
      .getText()
      .then(paginatorCount => {
        page.searchBox.sendKeys('search for test documents');
        page.searchBox.sendKeys(protractor.Key.ENTER);

        expect(page.paginatorCounts.get(0).getText()).not.toEqual(paginatorCount);
      });
  });
});
