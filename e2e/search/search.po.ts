import {browser, by, element, ExpectedConditions} from 'protractor';

export class SearchPage {
  autoCompletePanel = element(by.id('mat-autocomplete-0'));
  autoCompletedOption = this.autoCompletePanel.element(by.css(' .mat-option-text'));
  pageUrl = `${browser.baseUrl}/${this.profile}/tab-search`;
  selectedFacet = element(by.className('mat-chip'));
  testStudentId = '9780100';
  testStudentName = 'Adams, Margaret';

  constructor(private profile: string = 'demo') {
  }

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
    element(by.css('[appcustomtext=\'addContentItemButton\']')).click();
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

  clickFacetText(facetText: string) {
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

  removeSelectedFacet() {
    this.selectedFacet.element(by.className('mat-icon-button')).click();
  }

  clickAutoCompletedText(text: string) {
  }
}
