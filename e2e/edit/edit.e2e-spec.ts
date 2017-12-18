import { EditPage } from './edit.po';
import { browser } from 'protractor';
import { SearchPage } from '../search/search.po';

const getCurrentUrl = function() {
  return browser.getCurrentUrl().then(url => {
    return url.toLowerCase();
  });
};

const getSearchPageUrl = function() {
  const searchPage = new SearchPage();
  return searchPage.pageUrl;
};

describe('content-services-ui Edit Page', () => {
  let page: EditPage;
  const demoConfig = require('../mocks/profile-api/demo.json');

  beforeAll(() => {
    page = new EditPage();
    page.navigateTo();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(demoConfig.pages.edit.pageName);
  });

  it('should display pdf viewer when pdf file is uploaded', () => {
    page.uploadFile();

    expect(page.getPdfViewer().isDisplayed());
  });

  it('should re-display file upload panel after uploaded file is removed', () => {
    page.uploadFile();
    page.removeFile();

    expect(page.uploadButton.isDisplayed());
  });

  it('should navigate to Search page when Return to Results link is clicked', () => {
    page.clickReturnToResultsLink();

    expect(getCurrentUrl()).toMatch(getSearchPageUrl());
  });
});
