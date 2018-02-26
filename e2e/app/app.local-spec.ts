import {ContentServicesUiPage} from './app.po';
import {SearchPage} from '../search/search.po';
import {browser} from 'protractor';

const page = new ContentServicesUiPage();
const TITLE = 'Content Services';

describe('App Landing Page', () => {
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

  it('should display default instructions for user with access', () => {
    expect(page.defaultMessage.getText()).toEqual('To access this service, please click a link below:');
  });
});

describe('App navigation', () => {
  beforeEach(() => {
    page.navigateTo();
  });

  afterEach(() => {
    browser.waitForAngularEnabled(true);
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
