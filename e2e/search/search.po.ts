import { browser, by, element, ExpectedConditions, WebElement, protractor } from 'protractor';
import { promise } from 'selenium-webdriver';
import { EditPage } from '../edit/edit.po';
import { BrowserUtils } from '../browserUtils';
import { SearchResultsPageObject } from './search-results.po';

export class SearchPage {
  private utils = new BrowserUtils;

  autoCompletePanel = element(by.className('mat-autocomplete-panel'));
  autoCompletedOption = this.autoCompletePanel.element(by.css('.mat-option-text'));
  pageUrl = `${browser.baseUrl}${this.profile}/tab-search`;
  selectedFacet = element.all(by.className('mat-chip'));
  idColumnHeaderButton = element(by.buttonText('Id'));
  dateRangeInput = element(by.css('.cs-search-daterange-picker input'));
  dateRangePicker = element(by.className('md-drppicker'));
  searchBox = element(by.id('search-field'));
  displayAllButton = element(by.className('cs-display-search-button'));
  moreButton = element(by.name('more'));
  lessButton = element(by.name('less'));
  facetItemsLocator = by.className('mat-list-item');
  searchButton = element(by.name('searchButton'));
  paginatorCounts = element.all(by.className('mat-paginator-range-label'));
  paginatorSizeDropDowns = element.all(by.css('.mat-paginator-page-size-select mat-select'));
  paginatorNextButtons = element.all(by.className('mat-paginator-navigation-next'));
  clearSearchBoxButton = element(by.name('clearSearchBoxButton'));
  liveAnnouncer = element(by.className('cdk-live-announcer-element'));
  tableHeaders = element.all(by.className('mat-header-cell'));
  toggleFacetsPanelButton = element(by.className('toggle-panel-btn'));
  toggleBulkUpdateModeButton = element(by.className('cs-toggle-bulk-update-button'));
  bulkUpdateNextButton = element(by.className('cs-bulk-update-next-button'));
  facetsElement = element(by.tagName('app-facets-box'));

  constructor(private profile: string = 'demo') {}

  navigateTo() {
    return browser.get(this.pageUrl).catch(() => {
      this.utils.clickAcceptAlert(true);
      return browser.get(this.pageUrl);
    });
  }

  get searchResults(): SearchResultsPageObject {
    return new SearchResultsPageObject(element(by.css('app-search-results')));
  }

  getPageTitle() {
    return browser.getTitle();
  }

  getSearchBoxInputText() {
    return this.searchBox.getAttribute('value');
  }

  getPaginators() {
    return element.all(by.className('mat-paginator'));
  }

  waitForElementToBeVisible(elem) {
    browser.wait(ExpectedConditions.visibilityOf(elem), 10000);
  }

  clickUploadButton() {
    element(by.className('cs-upload-new-document-button')).click();
  }

  getHeaderToolbarText() {
    return element(by.className('cs-title')).getText();
  }

  isSortIndicatorDesc() {
    return element.all(by.className('mat-sort-header-indicator')).each((sortIndicator) => {
      sortIndicator.getAttribute('style').then((attr) => {
        return attr === 'transform: translateY(10px)';
      });
    });
  }

  clickPartialLinkText(facetText: string) {
    element(by.partialLinkText(facetText)).click();
  }

  removeSelectedFacet(facetIndex: number = 0) {
    this.selectedFacet.get(facetIndex).element(by.className('mat-icon-button')).click();
  }

  goToEditPage(profile: string, editPageTitle: string, idRowIndex: number = 0) {
    this.searchResults.getResultsByColumn('id').then((ids) => {
      this.clickPartialLinkText(ids[idRowIndex]);
      browser.wait(ExpectedConditions.titleIs(editPageTitle));
      const editPage = new EditPage(profile, ids[idRowIndex]);
      expect(browser.getCurrentUrl()).toEqual(editPage.pageUrl);
    });
  }

  clickFacetLink(facetIndex: number) {
    element.all(this.facetItemsLocator).get(facetIndex).click();
  }

  getFacetText(facetIndex: number) {
    return element.all(this.facetItemsLocator).then((items) => {
      return items[facetIndex].getText();
    });
  }

  getButtonByText(buttonText: string) {
    return element(by.buttonText(buttonText));
  }

  getDateRangeInputText() {
    return this.dateRangeInput.getAttribute('value');
  }

  getFacet(facetHeaderIndex: number) {
    return element.all(by.css('.cs-facet-box .mat-list')).get(facetHeaderIndex);
  }

  getFacetItems(facetHeaderIndex: number, facetItemIndex: number) {
    return this.getFacet(facetHeaderIndex).all(this.facetItemsLocator).get(facetItemIndex);
  }

  getFacetItemLinks(facetHeaderIndex: number) {
    return this.getFacet(facetHeaderIndex).all(this.facetItemsLocator).all(by.tagName('a'));
  }

  getFacetItemLinksTexts(facetHeaderIndex: number) {
    return this.getFacetItemLinks(facetHeaderIndex).getText();
  }

  getBackgroundColor(webElement: WebElement) {
    return webElement.getCssValue('background-color');
  }

  mouseOver(webElement: WebElement) {
    browser.actions().mouseMove(webElement).perform();
  }

  getResultColumnsPaddingSizes() {
    return element.all(by.className('cs-search-table-cell')).getCssValue('padding-right');
  }

  /**
   * Waits for the accessibility live announcer component to contain the expected text.
   * It will print friendly error with expected and latest actual after timeout.
   * @param expectedSubText The expected sub text to wait for.
   * @param timeoutMilliseconds The timeout in milliseconds to wait for.
   */
  waitForLiveAnnouncerText(expectedSubText: string, timeoutMilliseconds: number = 5000): promise.Promise<any> {
    return this.utils.waitForFunc(
      this.liveAnnouncer.getText,
      (val) => val.indexOf(expectedSubText) >= 0,
      timeoutMilliseconds
    ).then(() => expect(this.liveAnnouncer.getText()).toContain(expectedSubText));
  }

  clickPaginatorSizeOption(size: string) {
    element.all(by.cssContainingText('.mat-option-text', size)).get(0).click();
    const selectPanel = element(by.className('mat-select-panel'));
    browser.wait(ExpectedConditions.invisibilityOf(selectPanel), 5000);
  }
}
