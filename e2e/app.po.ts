import { browser, by, element } from 'protractor';

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
}
