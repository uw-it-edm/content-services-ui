import { browser, by, element, ExpectedConditions } from 'protractor';

export class ContentServicesUiPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-404 h1')).getText();
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
    const tenantMenuButton = element(by.id('tenant-menu'));

    expect(tenantMenuButton).toBeTruthy();
    browser.wait(ExpectedConditions.elementToBeClickable(tenantMenuButton), 5000);
    tenantMenuButton.click();
  }

  clickAppMenuItem(itemIndex: number) {
    const menuItem = element.all(by.className('tenant-menu-button')).get(itemIndex);

    browser.wait(ExpectedConditions.elementToBeClickable(menuItem), 500);
    menuItem.click();
  }

  getCurrentUrl() {
    return browser.getCurrentUrl();
  }
}
