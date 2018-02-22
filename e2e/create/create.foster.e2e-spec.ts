///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import {CreatePage} from './create.po';
import {browser} from 'protractor';
import {until} from 'selenium-webdriver';
import * as path from 'path';

describe('Foster Create Page', () => {
  const profile = 'foster';
  const page = new CreatePage(profile);

  beforeAll(() => {
    page.navigateTo();
    browser.wait(until.titleIs('Upload Documents'));
  });

  it('should create file successfully', () => {
    const filePath = path.resolve(__dirname, '../mocks/files/sample-file.txt');
    page.chooseFile(filePath);
    page.clickSave();

    expect(until.alertIsPresent()).toBeTruthy();
    expect(page.getSnackBarText()).toContain('Saved item');
  });
});
