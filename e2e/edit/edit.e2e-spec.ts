import {EditPage} from './edit.po';
import {browser} from 'protractor';
import {SearchPage} from '../search/search.po';
import {ContentServicesUiPage} from '../app/app.po';

const getCurrentUrl = function() {
  return browser.getCurrentUrl().then(url => {
    return url.toLowerCase();
  });
};

describe('content-services-ui Edit Page', () => {
  const page = new EditPage();
  const demoConfig = require('../mocks/profile-api/demo.json');
  const searchPage = new SearchPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(demoConfig.pages.edit.pageName);
  });

  it('should display pdf viewer when file is replaced with pdf file', () => {
    page.replaceFile();

    expect(page.getPdfViewer().isDisplayed());
  });

  it('should navigate to Search page when Return to Results link is clicked', () => {
    page.clickReturnToResultsLink();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });

  it('should navigate to Search page when header App Name link is clicked', () => {
    const appPage = new ContentServicesUiPage();
    appPage.headerTitle.click();

    expect(getCurrentUrl()).toMatch(searchPage.pageUrl);
  });
});
