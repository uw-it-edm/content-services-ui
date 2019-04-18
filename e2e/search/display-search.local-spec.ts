import { DisplaySearchPage } from './display-search.po';
import { SearchPage } from './search.po';
import { browser } from 'protractor';
import { ContentServicesUiPage } from '../app/app.po';

let page: DisplaySearchPage;

describe('Search Display All Page', () => {
  const demoConfig = require('../mocks/profile-api/demo.json');

  beforeEach(() => {
    page = new DisplaySearchPage();
    page.navigateTo();
  });

  it('should have no accessibility violations', () => {
    const app = new ContentServicesUiPage();
    app.runAccessibilityChecks();
  });

  it('should display page title', () => {
    expect(DisplaySearchPage.getPageTitle()).toEqual(demoConfig.pages['tab-search'].pageName);
  });

  it('should display correct number of file viewers', () => {
    const searchJson = require('../mocks/search-api/search.json');
    const searchResultsCount = Object.keys(searchJson.searchResults).length;
    expect(page.fileViewers.count()).toBe(searchResultsCount);
  });

  it('should navigate to Search page when Return to Search button is clicked', () => {
    page.returnToSearchButton.click();

    const getCurrentUrl = function() {
      return browser.getCurrentUrl().then(url => {
        return url.toLowerCase();
      });
    };

    const searchPage = new SearchPage();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should display scroll bar in all file viewers', () => {
    DisplaySearchPage.getFileViewersScrollingAttribute().then(attributes => {
      for (const attr of attributes) {
        expect(attr).toEqual('yes');
      }
    });
  });
});
