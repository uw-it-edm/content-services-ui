import { SearchPage } from './search.po';

describe('content-services-ui Search Page', () => {
  let page: SearchPage;
  const TITLE = 'Demonstration Search';

  beforeAll(() => {
    page = new SearchPage();
  });

  beforeEach(() => {
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

  it('should default page paginators size to 10', () => {
    expect(page.getPaginatorSelectedTexts()).toEqual(['10', '10']);
  });

  it('should display page size options when page paginator selector is clicked', () => {
    page.clickPaginatorArrow();
    page.waitForElementToBeVisible(page.getPaginatorOptionsPanel());

    expect(page.getPaginatorOptionsTexts()).toEqual(['5', '10', '25', '100']);
  });

  it('should display page size of 100 when that page size is selected', () => {
    page.clickPaginatorArrow();
    page.waitForElementToBeVisible(page.getPaginatorOptionsPanel());
    page.clickPaginatorSize(3);

    expect(page.getPaginatorSelectedTexts()).toEqual(['100', '100']);
  });
});
