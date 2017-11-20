import { EditPage } from './edit.po';

describe('content-services-ui Edit Page', () => {
  let page: EditPage;
  const TITLE = 'Edit Content Item';

  beforeAll(() => {
    page = new EditPage();
    page.navigateTo();
  });

  it('should display page title', () => {
    expect(page.getPageTitle()).toEqual(TITLE);
  });
});
