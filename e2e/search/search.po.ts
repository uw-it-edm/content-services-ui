import { browser, by, element, ExpectedConditions } from 'protractor';
import { EditPage } from '../edit/edit.po';

export class SearchPage {
  autoCompletePanel = element(by.className('mat-autocomplete-panel'));
  autoCompletedOption = this.autoCompletePanel.element(by.css('.mat-option-text'));
  pageUrl = `${browser.baseUrl}/${this.profile}/tab-search`;
  selectedFacet = element.all(by.className('mat-chip'));
  idColumHeaderButton = element(by.buttonText('Id'));

  constructor(private profile: string = 'demo') {}

  navigateTo() {
    return browser.get(this.pageUrl);
  }

  getPageTitle() {
    return browser.getTitle();
  }

  searchBox() {
    return element(by.id('search-field'));
  }

  getSearchBoxInputText() {
    return this.searchBox().getAttribute('value');
  }

  getPaginators() {
    return element.all(by.className('mat-paginator'));
  }

  waitForElementToBeVisible(elem) {
    browser.wait(ExpectedConditions.visibilityOf(elem), 10000);
  }

  clickUploadButton() {
    element(by.css('.cs-generic-header .mat-button')).click();
  }

  getHeaderToolbarText() {
    return element(by.className('cs-title')).getText();
  }

  isSortIndicatorDesc() {
    return element(by.className('mat-sort-header-indicator'))
      .getAttribute('style')
      .then(attr => {
        return attr === 'transform: translateY(10px)';
      });
  }

  clickPartialLinkText(facetText: string) {
    element(by.partialLinkText(facetText)).click();
  }

  getResultsByColumn(column: string) {
    const selector = '.mat-cell.mat-column-' + column;
    return element.all(by.css(selector)).getText();
  }

  getDistinctResultsByColumn(column: string) {
    return this.getResultsByColumn(column).then(results => {
      return Array.from(new Set(results));
    });
  }

  removeSelectedFacet(facetIndex: number = 0) {
    this.selectedFacet
      .get(facetIndex)
      .element(by.className('mat-icon-button'))
      .click();
  }

  goToEditPage(profile: string, editPageTitle: string, idRowIndex: number = 0) {
    this.getResultsByColumn('id').then(ids => {
      this.clickPartialLinkText(ids[idRowIndex]);
      browser.wait(ExpectedConditions.titleIs(editPageTitle));
      const editPage = new EditPage(profile, ids[idRowIndex]);
      expect(browser.getCurrentUrl()).toEqual(editPage.pageUrl);
    });
  }

  clickFacetLink(facetIndex: number) {
    this.getFacetText(facetIndex).then(text => {
      this.clickPartialLinkText(text);
    });
  }

  getFacetText(facetIndex: number) {
    return element.all(by.css('.mat-list-item a')).then(items => {
      return items[facetIndex].getText();
    });
  }
}
