import { BulkEditPage } from './bulk-edit.po';
import { SearchPage } from '../search/search.po';
import { ContentServicesUiPage } from '../app/app.po';
import { BrowserUtils } from '../browserUtils';

describe('Bulk Update Flow', () => {
  const editPage = new BulkEditPage();
  const searchPage = new SearchPage();
  const utils = new BrowserUtils();

  it('should have no accessibility violations', () => {
    editPage.navigateTo();

    const app = new ContentServicesUiPage();
    app.runAccessibilityChecks();
  });

  it('should allow user to update multiple documents at once', () => {
    searchPage.navigateTo();

    // enter bulk edit mode in search page
    searchPage.toggleBulkUpdateModeButton.click();
    utils.waitForElementText('h2', 'Bulk Update Mode');

    // select 3 rows and click the next button to go to second screen
    searchPage.searchResults.selectRows(0, 1, 2);
    utils.waitForElementText(searchPage.bulkUpdateNextButton, 'Edit 3 Documents');
    searchPage.bulkUpdateNextButton.click();
    utils.waitForElementText('h2', 'Demo | Bulk Update');

    // verify the 3 rows are displayed on the edit page
    expect(editPage.searchResults.getResultsByColumn('id')).toEqual(['123', '234', '456']);

    // set a field value and update
    editPage.inputFields.get(0).sendKeys('test value');
    editPage.updateButton.click();

    // Wait for all rows to be gone and verify success message
    editPage.searchResults.waitForRowCount(0);
    utils.waitForSnackBarText('Updated 3 documents');
  });
});
