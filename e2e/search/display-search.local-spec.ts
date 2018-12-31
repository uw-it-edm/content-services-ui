import {DisplaySearchPage} from './display-search.po';

let page: DisplaySearchPage;

describe('Search Page', () => {
  const demoConfig = require('../mocks/profile-api/demo.json');

  beforeEach(() => {
    page = new DisplaySearchPage();
    page.navigateTo();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(demoConfig.pages['tab-search'].pageName);
  });
});
