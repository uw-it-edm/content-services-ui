import {browser} from 'protractor';
import {SearchPage} from './search.po';

export class DisplaySearchPage {
  searchPage = new SearchPage();
  searchParam = '{"_filters":[{}],"pagination":{"pageIndex":0,"pageSize":50}}';
  pageUrl = `${this.searchPage.pageUrl}/display-search/${this.searchParam}`;

  navigateTo() {
    return browser.get(this.pageUrl);
  }
}
