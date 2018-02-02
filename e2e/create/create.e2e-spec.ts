///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import {CreatePage} from './create.po';
import {browser} from 'protractor';
import {until} from 'selenium-webdriver';

describe('content-services-ui e2e Create Page', () => {
  let page: CreatePage;

  beforeAll(() => {
    page = new CreatePage();
    page.navigateTo();
    browser.wait(until.titleIs('Create Content Item'));
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual('Create Content Item');
  });
});
