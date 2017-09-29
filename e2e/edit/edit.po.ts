import { browser } from 'protractor';

export class EditPage {
  navigateTo() {
    return browser.get('/demo/tab-search/edit/123456');
  }

  getPageTitle() {
    return browser.getTitle();
  }
}
