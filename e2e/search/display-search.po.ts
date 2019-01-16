import {browser, by, element} from 'protractor';
import {SearchPage} from './search.po';

export class DisplaySearchPage {
  searchPage = new SearchPage();
  searchParam = '{"_filters":[{}],"pagination":{"pageIndex":0,"pageSize":50}}';
  pageUrl = `${this.searchPage.pageUrl}/display-search?s=${this.searchParam}`;
  fileViewers = element.all(by.tagName('app-document-displayer'));
  returnToSearchButton = element(by.name('returnToSearch'));

  navigateTo() {
    return browser.get(this.pageUrl);
  }

  getPageTitle() {
    return browser.getTitle();
  }
}
