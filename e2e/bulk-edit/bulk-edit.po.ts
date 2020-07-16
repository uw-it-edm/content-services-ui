import { browser, element, by, ElementFinder } from 'protractor';
import { BrowserUtils } from '../browserUtils';
import { SearchResultsPageObject } from '../page-objects/search-results.po';
import { ContentMetadataPageObject } from '../page-objects/content-metadata.po';

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
   * Gets a page object to interact with the content metadata component.
   */
  get fields(): ContentMetadataPageObject {
    return new ContentMetadataPageObject(element(by.tagName('app-content-metadata')));
  }

  /**
   * Gets the update button of the page.
   */
  get updateButton(): ElementFinder {
    return element(by.className('update-button'));
  }

  /**
   * Gets the cancel/close button of the page.
   */
  get cancelButton(): ElementFinder {
    return element(by.className('cancel-button'));
  }

  /**
   * Get the reset fields button of the page.
   */
  get resetButton(): ElementFinder {
    return element(by.className('reset-button'));
  }
}
