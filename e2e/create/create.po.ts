import {browser, by, element} from 'protractor';
import * as path from 'path';

export class CreatePage {
  public pageUrl = '/demo/create';
  private pdfFilePath = path.resolve(__dirname, '../sample-file.pdf');
  private docFilePath = path.resolve(__dirname, '../sample-file.docx');

  navigateTo() {
    return browser.get(this.pageUrl);
  }

  getPageTitle() {
    return browser.getTitle();
  }

  addFile() {
    element(by.id('addFile')).sendKeys(this.pdfFilePath);
  }

  chooseFile() {
    element(by.id('attach-files')).sendKeys(this.pdfFilePath);
  }

  getPdfViewer() {
    return element(by.tagName('pdf-viewer'));
  }

  clickCancelButton() {
    element(by.id('cancel')).click();
  }

  clickReturnToResultsButton() {
    element(by.css('.mat-icon-button[mattooltip=\'Return to Results\']')).click();
  }
}
