import {CreatePage} from './create.po';
import {SearchPage} from '../search/search.po';
import {browser} from 'protractor';

const getCurrentUrl = function() {
  return browser.getCurrentUrl().then(url => {
    return url.toLowerCase();
  });
};

const getSearchPageUrl = function() {
  const searchPage = new SearchPage();
  return searchPage.pageUrl;
};

describe('content-services-ui Create Page', () => {
  let page: CreatePage;
  const TITLE = 'Create Content Item';

  beforeAll(() => {
    page = new CreatePage();
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(TITLE);
  });

  it('should navigate to Search page when Cancel button is clicked', () => {
    page.clickCancelButton();

    expect(getCurrentUrl()).toMatch(getSearchPageUrl());
  });

  it('should navigate to Search page when Return to Results button is clicked', () => {
    page.clickReturnToResultsButton();

    expect(getCurrentUrl()).toMatch(getSearchPageUrl());
  });

  it('should display pdf viewer when 1 pdf file is uploaded with Add File button', () => {
    page.addFile();

    expect(page.getPdfViewer().isDisplayed());
  });

  it('should display pdf viewer when 1 pdf file is uploaded with Choose Files button', () => {
    page.chooseFile();

    expect(page.getPdfViewer().isDisplayed());
  });
});
