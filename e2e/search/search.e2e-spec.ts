///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import {SearchPage} from './search.po';
import {browser} from 'protractor';
import {until} from 'selenium-webdriver';

describe('content-services-ui e2e Search Page', () => {
  let page: SearchPage;

  beforeAll(() => {
    page = new SearchPage();
    page.navigateTo();
    browser.wait(until.titleIs('Demonstration Search'));
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual('Demonstration Search');
  });
});
