///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import { CreatePage } from './create.po';
import { browser, ExpectedConditions } from 'protractor';
import * as path from 'path';

describe('Foster Create Page', () => {
  const profile = 'foster';
  const page = new CreatePage(profile);

  beforeAll(() => {
    page.navigateTo();
    browser.wait(ExpectedConditions.titleIs('Upload Documents'));
  });

  it('should create item without any metadata successfully ', () => {
    const filePath = path.resolve(__dirname, '../mocks/files/sample-file.txt');
    page.chooseFile(filePath);
    page.saveButton.click();

    expect(page.getSnackBarText()).toContain('Saved item');
  });
});
