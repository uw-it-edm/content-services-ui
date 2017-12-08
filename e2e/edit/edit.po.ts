import { browser } from 'protractor';

export class EditPage {
  navigateTo() {
    return browser.get('/demo/edit/123456');
  }

  getPageTitle() {
    return browser.getTitle();
  }
}
