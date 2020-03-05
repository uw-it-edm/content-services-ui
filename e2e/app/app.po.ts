import { browser, by, element, ExpectedConditions } from 'protractor';

export class ContentServicesUiPage {
  public uwLogo = element(by.className('uw-patch'));
  public headerTitle = element(by.className('cs-title'));
  public defaultMessage = element(by.css('.uw-default .cs-main h3'));

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

  getHeaderToolbarText() {
    return this.headerTitle.getText();
  }

  clickAppMenuIcon() {
    const tenantMenuButton = element(by.id('tenant-menu'));

    expect(tenantMenuButton).toBeTruthy();
    browser.wait(ExpectedConditions.elementToBeClickable(tenantMenuButton), 10000);
    tenantMenuButton.click();
  }

  clickAppMenuItem(itemIndex: number) {
    const menuItem = element.all(by.className('tenant-menu-button')).get(itemIndex);
    expect(menuItem).toBeTruthy();
    browser.sleep(100);
    browser.wait(ExpectedConditions.elementToBeClickable(menuItem), 10000, `Tenant at index ${itemIndex} is not clickable.`);
    menuItem.click();
  }

  getCurrentUrl() {
    return browser.getCurrentUrl();
  }

  switchTab(tabIndex = 1) {
    browser.waitForAngularEnabled(false);
    browser.getAllWindowHandles().then(windowHandle => {
      browser.switchTo().window(windowHandle[tabIndex]);
    });
  }

  runAccessibilityChecks() {
    const AxeBuilder = require('axe-webdriverjs');
    const util = require('util');

    AxeBuilder(browser.driver)
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
      .then(results => {
        expect(results.violations.length).toBe(0, '\n' + util.inspect(results.violations, false, null, true));
      })
      .catch(err => {
        console.log('Error running accessibility report: ' + err);
      });
  }
}
