import { ContentServicesUiPage } from './app.po';

describe('content-services-ui App', () => {
  let page: ContentServicesUiPage;
  const TITLE = 'Content Services';

  beforeAll(() => {
    page = new ContentServicesUiPage();
    page.navigateTo();
  });

  it('should display welcome message', () => {
    expect(page.getParagraphText()).toEqual('Inconceivable!');
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(TITLE);
  });

  it('should display header toolbar in purple', () => {
    expect(page.getHeaderBackgroundColor()).toEqual('rgba(75, 46, 131, 1)');
  });

  it('should display title in header toolbar', () => {
    expect(page.getHeaderToolbarText()).toEqual(TITLE);
  });

  it('should display UW logo with href link in header toolbar', () => {
    expect(page.getUWLogoElement().isDisplayed()).toBe(true);
    expect(page.getUWLogoElement().getAttribute('href')).toContain('uw.edu');
    expect(page.getUWLogoElement().getAttribute('title')).toEqual('University of Washington Home');
  });
});
