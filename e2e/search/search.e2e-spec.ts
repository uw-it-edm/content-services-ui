///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import { SearchPage } from './search.po';
import { CreatePage } from '../create/create.po';
import { browser } from 'protractor';

describe('content-services-ui Search Page', () => {
  let page: SearchPage;
  const TITLE = 'Demonstration Search';

  beforeAll(() => {
    page = new SearchPage();
    page.navigateTo();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(TITLE);
  });

  it('should accept text input in searchbox and retains the value', () => {
    const searchText = 'this is a sample test';
    page.getSearchBox().sendKeys(searchText);
    expect(page.getSearchBoxInputText()).toEqual(searchText);
  });

  it('should display 2 page paginators', () => {
    expect(page.getPaginators().count()).toEqual(2);
  });

  it('should navigate to Upload page when upload button is clicked', () => {
    page.clickUploadButton();

    const actualUrl = browser.getCurrentUrl().then(url => {
      return url.toLowerCase();
    });

    let createPage: CreatePage;
    createPage = new CreatePage();
    expect(actualUrl).toMatch(createPage.pageUrl.toLowerCase());
  });
});
