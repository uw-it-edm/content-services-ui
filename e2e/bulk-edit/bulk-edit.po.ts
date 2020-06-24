import { browser, element, by, ElementArrayFinder, ElementFinder } from 'protractor';
import { BrowserUtils } from '../browserUtils';
import { SearchResultsPageObject } from '../search/search-results.po';

/**
 * Page object to interact with the BulkEditPageComponent.
 */
export class BulkEditPage {
  private utils = new BrowserUtils();

  constructor(private profile: string = 'demo') {}

  /**
   * Directly navigates to the bulk edit page.
   */
  navigateTo() {
    const url = `${browser.baseUrl}${this.profile}/bulk-edit`;

    return browser.get(url).catch(() => {
      this.utils.clickAcceptAlert(true);
      return browser.get(url);
    });
  }

  /**
   * Gets a page object to interact with the search results component.
   */
  get searchResults(): SearchResultsPageObject {
    return new SearchResultsPageObject(element(by.css('app-search-results')));
  }

  /**
   * Gets all the input fields of the content metadata component.
   */
  get inputFields(): ElementArrayFinder {
    return element.all(by.css('app-content-metadata .mat-input-element'));
  }

  /**
   * Gets the update button of the page.
   */
  get updateButton(): ElementFinder {
    return element(by.css('.update-button'));
  }
}
