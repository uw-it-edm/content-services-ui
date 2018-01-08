import {browser, by, element, ExpectedConditions} from 'protractor';

export class SearchPage {
  public pageUrl = '/demo/tab-search';

  navigateTo() {
    return browser.get(this.pageUrl);
  }

  getPageTitle() {
    return browser.getTitle();
  }

  getSearchBox() {
    return element(by.id('search-field'));
  }

  getSearchBoxInputText() {
    return this.getSearchBox().getAttribute('value');
  }

  getPaginators() {
    return element.all(by.className('mat-paginator'));
  }

  waitForElementToBeVisible(elem) {
    browser.wait(ExpectedConditions.visibilityOf(elem), 10000);
  }

  clickUploadButton() {
    element(by.css('[appcustomtext="addContentItemButton"]')).click();
  }

  getHeaderToolbarText() {
    return element(by.className('cs-title')).getText();
  }
}
