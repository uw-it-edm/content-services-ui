import { BulkEditPage } from './bulk-edit.po';
import { SearchPage } from '../search/search.po';
import { ContentServicesUiPage } from '../app/app.po';
import { BrowserUtils } from '../browserUtils';

const bulkEditPage = new BulkEditPage();
const searchPage = new SearchPage();
const utils = new BrowserUtils();

describe('Bulk Update Page', () => {
  it('should have no accessibility violations', () => {
    bulkEditPage.navigateTo();

    const app = new ContentServicesUiPage();
    app.runAccessibilityChecks();
  });
});

describe('Bulk Update Flow', () => {
  beforeEach(() => {
    searchPage.navigateTo();

    // enter bulk edit mode in search page
    searchPage.toggleBulkUpdateModeButton.click();
    utils.waitForElementText('h2', 'Bulk Update Mode');

    // select 3 rows and click the next button to go to second screen
    searchPage.searchResults.selectRows(0, 1, 2);
    utils.waitForElementText(searchPage.bulkUpdateNextButton, 'Edit 3 Documents');
    searchPage.bulkUpdateNextButton.click();
    utils.waitForElementText('h2', 'Demo | Bulk Update');
  });

  it('should allow user to update multiple documents at once', () => {
    // verify the 3 rows are displayed on the edit page
    expect(bulkEditPage.searchResults.getResultsByColumn('id')).toEqual(['123', '234', '456']);

    // set a field value and update
    bulkEditPage.fields.inputElements.get(0).sendKeys('test value');
    bulkEditPage.updateButton.click();

    // Wait for all rows to be gone and verify success message
    bulkEditPage.searchResults.waitForRowCount(0);
    utils.waitForSnackBarText('Updated 3 documents');

    // Close the bulk update mode and verify return to search page.
    bulkEditPage.cancelButton.click();
    utils.waitForElementText('h2', 'Demonstration Search');
  });

  it('should add required validator if parent cascading select has value and child does not', () => {
    const parentField = bulkEditPage.fields.getSelectFormField('DataApiOption parent');
    const childField = bulkEditPage.fields.getSelectFormField('DataApiOption child');

    // verify child is not required on load.
    expect(childField.optionsInputElement.getAttribute('required')).toBeFalsy();

    // select value of parent, verify child is now required
    parentField.selectValue(1);
    expect(childField.optionsInputElement.getAttribute('required')).toBeTruthy();

    // select value of child, verify child validator is removed
    childField.selectValue(1);
    expect(childField.optionsInputElement.getAttribute('required')).toBeFalsy();
  });

  it('should remove child required validator when fields are reset', () => {
    const parentField = bulkEditPage.fields.getSelectFormField('DataApiOption parent');
    const childField = bulkEditPage.fields.getSelectFormField('DataApiOption child');

    // verify child is not required on load.
    expect(childField.optionsInputElement.getAttribute('required')).toBeFalsy();

    // select value of parent, verify child is now required
    parentField.selectValue(1);
    expect(childField.optionsInputElement.getAttribute('required')).toBeTruthy();

    // reset fields, verify child validator is removed.
    bulkEditPage.resetButton.click();
    expect(childField.optionsInputElement.getAttribute('required')).toBeFalsy();
  });

  it('should be able to add and remove options from filter select with multi select', () => {
    // verify filter select component loads with no selections and update button is disabled.
    const filterSelect = bulkEditPage.fields.getFilterSelectFormField('DataApiOption with filter multi select');
    expect(filterSelect.selectedOptions.count()).toEqual(0);
    expect(bulkEditPage.updateButton.isEnabled()).toBeFalsy();

    // select an option, verify update button becomes enabled.
    filterSelect.addOptionAt(1);
    filterSelect.waitForSelectionCount(1);
    expect(filterSelect.getSelectedValues()).toEqual(['val 2 label']);
    expect(bulkEditPage.updateButton.isEnabled()).toBeTruthy();

    // remove option, verify update button becomes disabled again.
    filterSelect.removeOptionAt(0);
    filterSelect.waitForSelectionCount(0);
    expect(filterSelect.selectedOptions.count()).toEqual(0);
    expect(bulkEditPage.updateButton.isEnabled()).toBeFalsy();
  });
});
