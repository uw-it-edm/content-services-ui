import {browser, by, element} from 'protractor';
import {SearchPage} from './search.po';

export class DisplaySearchPage {
  searchPage = new SearchPage();
  searchParam = '{"_filters":[],"pagination":{"pageIndex":0,"pageSize":50},"order":{}}';
  pageUrl = `${this.searchPage.pageUrl}/display-search?s=${this.searchParam}`;
  fileViewers = element.all(by.tagName('app-document-displayer'));
  returnToSearchButton = element(by.name('returnToSearch'));

  static getPageTitle() {
    return browser.getTitle();
  }

  static getFileViewersScrollingAttribute() {
     return element.all(by.name('iframe-content-display')).getAttribute('scrolling');
  }

  navigateTo() {
    return browser.get(this.pageUrl);
  }

  getEncodedPageUrl() {
    return this.pageUrl
    .replace(/{/g, '%7B')
    .replace(/"/g, '%22')
    .replace(/\[/g, '%5B')
    .replace(/}/g, '%7D')
    .replace(/]/g, '%5D');
  }
}
