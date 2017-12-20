import {browser, by, element} from 'protractor';
import * as path from 'path';

export class EditPage {
  uploadButton = element(by.id('replaceFile'));

  navigateTo() {
    return browser.get('/demo/edit/123456');
  }

  getPageTitle() {
    return browser.getTitle();
  }

  clickReturnToResultsLink() {
    element(by.css('[mattooltip=\'Return to Results\']')).click();
  }

  replaceFile() {
    const pdfFilePath = '../sample-file.pdf';
    const absolutePath = path.resolve(__dirname, pdfFilePath);
    this.uploadButton.sendKeys(absolutePath);
  }

  getPdfViewer() {
    return element(by.tagName('pdf-viewer'));
  }

  removeFile() {
    element(by.css('app-file-upload button.mat-button')).click();
  }
}
