import { browser, by, element } from 'protractor';

export class SearchPage {
  navigateTo() {
    return browser.get('/demo/tab-search');
  }

  getPageTitle() {
    return browser.getTitle();
  }

  getSearchBox() {
    return element(by.id('md-input-0'));
  }

  getSearchBoxInputText() {
    return this.getSearchBox().getAttribute('ng-reflect-model');
  }
}
