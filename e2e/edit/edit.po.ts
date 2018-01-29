import {browser, by, element} from 'protractor';
import * as path from 'path';

export class EditPage {
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
    const pdfFilePath = path.resolve(__dirname, '../sample-file.pdf');
    element(by.name('replaceFile')).sendKeys(pdfFilePath);
  }

  getPdfViewer() {
    return element(by.tagName('pdf-viewer'));
  }

  removeFile() {
    element(by.css('app-file-upload button.mat-button')).click();
  }

  getLastModifiedDateText() {
    return element(by.css('[placeholder=\'Last Modified Date\']')).getAttribute('value');
  }

  getStudentText() {
    return element(by.id('mat-input-3')).getAttribute('value');
  }
}
