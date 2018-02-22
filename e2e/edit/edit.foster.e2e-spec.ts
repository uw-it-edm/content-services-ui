import {EditPage} from './edit.po';
import {browser} from 'protractor';
import {SearchPage} from '../search/search.po';
import {until} from 'selenium-webdriver';
import * as path from 'path';

describe('Foster Edit Page', () => {
  const profile = 'foster';
  const page = new EditPage(profile);
  const searchPage = new SearchPage(profile);
  const pageTitle = 'View or Edit Document';

  beforeAll(() => {
    searchPage.navigateTo();
    browser.wait(until.titleIs('Find Documents'));

    searchPage.goToEditPage(profile, pageTitle);
  });

  beforeEach(() => {
    browser.refresh();
    browser.wait(until.titleIs(pageTitle));
  });

  it('should replace file successfully', () => {
    const textFilePath = path.resolve(__dirname, '../mocks/files/sample-file.txt');
    page.replaceFile(textFilePath);

    page.saveButton.click();
    expect(until.alertIsPresent()).toBeTruthy();
    expect(page.getSnackBarText()).toContain('Saved item');
  });

});
