///<reference path="../../node_modules/@types/jasminewd2/index.d.ts"/>
import {CreatePage} from './create.po';
import {browser} from 'protractor';
import {until} from 'selenium-webdriver';
import * as path from 'path';

describe('Create Page', () => {
  let page: CreatePage;

  beforeAll(() => {
    page = new CreatePage('foster');
    page.navigateTo();
    browser.wait(until.titleIs('Upload Documents'));
  });

  it('should create and replace file successfully', () => {
    const textFilePath = path.resolve(__dirname, '../sample-file.txt');
    page.chooseFile(textFilePath);
    page.clickSave();
    expect(until.alertIsPresent());

    const snackBarMessage = page.getSnackBarText().then(msg => {
      return msg;
    });
    expect(snackBarMessage).toContain('Saved item');

    // let contentId = snackBarMessage.split(' ')[2];
    // console.log('content id : ' + contentId);

    // let pdfFilePath = path.resolve(__dirname, '../sample-file.pdf');
    // browser.waitForAngularEnabled(false);
    // page.replaceFile(0, pdfFilePath);
    // browser.waitForAngularEnabled(true);
  });
});
