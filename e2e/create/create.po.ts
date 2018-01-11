import {browser, by, element} from 'protractor';

export class CreatePage {
  public pageUrl = '/demo/create';
  public uploadFilePanel = element(by.id('drop-zone'));
  public fileList = element.all(by.tagName('mat-list-item'));

  navigateTo() {
    return browser.get(this.pageUrl);
  }

  getPageTitle() {
    return browser.getTitle();
  }

  addFile(filePath: string) {
    element(by.name('addFile')).sendKeys(filePath);
  }

  chooseFile(filePath: string) {
    element(by.id('attach-files')).sendKeys(filePath);
  }

  getPdfViewer() {
    return element(by.tagName('pdf-viewer'));
  }

  clickCancelButton() {
    element(by.id('cancel')).click();
  }

  clickReturnToResultsButton() {
    element(by.css('[mattooltip=\'Return to Results\']')).click();
  }

  clickAppName() {
    element(by.className('cs-title')).click();
  }

  getContentViewerText() {
    return element(by.css('.content-object-display .custom-text-rendered')).getText();
  }

  undoFile() {
    element(by.css('[mattooltip=\'Undo\']')).click();
  }

  getFileName(fileIndex: number) {
    return element.all(by.css('.mat-list-item-content .mat-list-text p > span')).then(names => {
      return names[fileIndex].getText();
    });
  }

  clickSave() {
    element(by.id('saveItem')).click();
  }

  replaceFile(fileIndex: number, filePath: string) {
    element.all(by.name('replaceFile')).then(replaceButtons => {
      replaceButtons[fileIndex].sendKeys(filePath);
    });
  }
}
