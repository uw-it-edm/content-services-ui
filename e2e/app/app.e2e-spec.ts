import {ContentServicesUiPage} from './app.po';
import {SearchPage} from '../search/search.po';

let page: ContentServicesUiPage;
page = new ContentServicesUiPage();
const TITLE = 'Content Services';

describe('content-services-ui App', () => {
  beforeAll(() => {
    page.navigateTo();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(TITLE);
  });

  it('should display header toolbar in purple', () => {
    expect(page.getHeaderBackgroundColor()).toEqual('rgba(75, 46, 131, 1)');
  });

  it('should display title in header toolbar', () => {
    expect(page.getHeaderToolbarText()).toEqual(' ');
  });

  it('should display UW logo with href link in header toolbar', () => {
    expect(page.uwLogo.isDisplayed());
    expect(page.uwLogo.getAttribute('href')).toContain('uw.edu');
    expect(page.uwLogo.getAttribute('title')).toEqual('University of Washington Home');
  });
});

describe('content-services-ui App navigation', () => {
  beforeEach(() => {
    page.navigateTo();
  });

  it('should navigate to search page when tenant is selected on app menu icon', () => {
    page.clickAppMenuIcon();
    page.clickAppMenuItem(0);

    let searchPage: SearchPage;
    searchPage = new SearchPage();

    expect(page.getCurrentUrl()).toContain(searchPage.pageUrl);
  });

  it('should navigate to UW home page on a new tab when UW logo is clicked', () => {
    page.uwLogo.click();

    page.switchTab(1);
    expect(page.getPageTitle()).toContain('UW Homepage');

    page.switchTab(0);
    expect(page.getPageTitle()).toEqual(TITLE);
  });
});
