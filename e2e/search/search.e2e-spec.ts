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
});
