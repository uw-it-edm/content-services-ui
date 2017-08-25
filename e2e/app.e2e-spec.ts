import { ContentServicesUiPage } from './app.po';

describe('content-services-ui App', () => {
  let page: ContentServicesUiPage;

  beforeEach(() => {
    page = new ContentServicesUiPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Inconceivable!');
  });
});
