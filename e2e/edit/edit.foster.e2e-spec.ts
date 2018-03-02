import { EditPage } from './edit.po';
import { browser, ExpectedConditions } from 'protractor';
import { SearchPage } from '../search/search.po';
import { until } from 'selenium-webdriver';
import * as path from 'path';

describe('Foster Edit Page', () => {
  const profile = 'foster';
  const searchPage = new SearchPage(profile);
  const pageTitle = 'View or Edit Document';
  let page = new EditPage(profile);
  let expectedIds;

  beforeEach(() => {
    searchPage.navigateTo();
    browser.wait(until.titleIs('Find Documents'));

    searchPage.getResultsByColumn('id').then(ids => {
      expectedIds = ids;
    });

    searchPage.goToEditPage(profile, pageTitle);
  });

  it('should persist replaced file', () => {
    const textFilePath = path.resolve(__dirname, '../mocks/files/sample-file.txt');
    page.replaceFile(textFilePath);

    page.saveButton.click();

    expect(until.alertIsPresent()).toBeTruthy();
    expect(page.getSnackBarText()).toContain('Saved item');

    browser.refresh();
    browser.wait(until.titleIs(pageTitle));
    browser.waitForAngular();
    expect(page.getFileName(0)).toEqual(path.parse(textFilePath).base);
  });

  it(
    'should navigate through the items from Search results when the Prev and Next buttons are clicked',
    () => {
      // Check only the first 10 to avoid jasmine timing out
      let total = expectedIds.length;
      if (total > 10) {
        total = 10;
      }

      for (let i = 0; i < total; i++) {
        page = new EditPage(profile, expectedIds[i]);
        browser.wait(ExpectedConditions.urlIs(page.pageUrl));

        const paginatorCount = i + 1;
        expect(page.getPaginatorText()).toEqual(paginatorCount + ' of ' + expectedIds.length);

        if (paginatorCount < expectedIds.length) {
          page.nextItemButton.click();
        }
      }
    },
    30000
  );

  it('should persist updated metadata', () => {
    page.dateInputField.get(0).clear();

    const date = new Date();
    const month = date.getMonth() + 1;
    const today = month + '/' + date.getDate() + '/' + date.getFullYear();
    page.dateInputField.get(0).sendKeys(today);

    page.saveButton.click();
    expect(until.alertIsPresent()).toBeTruthy();
    expect(page.getSnackBarText()).toContain('Saved item');

    browser.refresh();
    browser.wait(until.titleIs(pageTitle));
    browser.waitForAngular();
    expect(page.getDateText(0)).toEqual(today);
  });
});
