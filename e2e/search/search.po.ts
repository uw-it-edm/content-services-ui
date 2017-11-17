import { browser, by, element, ExpectedConditions } from 'protractor';

export class SearchPage {
  navigateTo() {
    return browser.get('/demo/tab-search');
  }

  getPageTitle() {
    return browser.getTitle();
  }

  getSearchBox() {
    return element(by.id('mat-input-0'));
  }

  getSearchBoxInputText() {
    return this.getSearchBox().getAttribute('ng-reflect-model');
  }

  getPaginators() {
    return element.all(by.className('mat-paginator'));
  }

  getPaginatorSelectedTexts() {
    return element.all(by.className('mat-select-value-text')).getText();
  }

  clickPaginatorArrow() {
    element
      .all(by.className('mat-select-arrow'))
      .get(0)
      .click();
  }

  getPaginatorOptionsTexts() {
    return element.all(by.className('mat-option')).getText();
  }

  getPaginatorOptionsPanel() {
    return element(by.className('mat-select-panel-done-animating'));
  }

  waitForElementToBeVisible(elem) {
    browser.wait(ExpectedConditions.visibilityOf(elem), 10000);
  }

  clickPaginatorSize(index) {
    const id = 'mat-option-' + index;
    element(by.id(id)).click();
  }
}
