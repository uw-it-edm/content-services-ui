import { browser, by, element, protractor } from 'protractor';

export class ContentServicesUiPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getPageTitle() {
    return browser.getTitle();
  }

  getHeaderBackgroundColor() {
    return element(by.css('header.uwit-cs-appbar.uw-thinstrip')).getCssValue('background-color');
  }

  getUWLogoElement() {
    return element(by.className('uw-patch'));
  }

  getHeaderToolbarText() {
    return element(by.className('cs-title')).getText();
  }

  clickAppMenuIcon() {
    element(by.className('mat-icon-button')).click();
  }

  clickAppMenuItem(itemIndex: number) {
    const menuItem = element.all(by.className('mat-menu-ripple')).get(itemIndex);
    browser.wait(protractor.ExpectedConditions.elementToBeClickable(menuItem), 500);
    menuItem.click();
  }

  getCurrentUrl() {
    return browser.getCurrentUrl();
  }
}
