import { browser, by, element } from 'protractor';

export class EditPage {
  navigateTo() {
    return browser.get('/demo/edit/123456');
  }

  getPageTitle() {
    return browser.getTitle();
  }

  clickReturnToResultsLink() {
    element(by.css('.cs-content-page .mat-toolbar-row a')).click();
  }
}
