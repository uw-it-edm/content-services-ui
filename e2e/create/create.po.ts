import { browser, by, element } from 'protractor';
import * as path from 'path';

export class CreatePage {
  public pageUrl = '/demo/create';

  navigateTo() {
    return browser.get(this.pageUrl);
  }

  getPageTitle() {
    return browser.getTitle();
  }

  uploadFile() {
    const pdfFilePath = '../sample-file.pdf';
    const absolutePath = path.resolve(__dirname, pdfFilePath);
    element(by.id('attach-files')).sendKeys(absolutePath);
  }

  getPdfViewer() {
    return element(by.tagName('pdf-viewer'));
  }

  clickCancelButton() {
    element(by.id('cancel')).click();
  }

  clickReturnToResultsLink() {
    element(by.css('.cs-content-page .mat-toolbar-row a')).click();
  }
}
