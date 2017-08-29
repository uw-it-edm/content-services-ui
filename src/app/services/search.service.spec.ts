import { SearchService } from './search.service';
import { Http } from '@angular/http';
import { User } from '../user/user';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../user/user.service';
import { SearchModel } from '../model/search/search-model';
import { PageConfig } from '../model/config/page-config';

class UserServiceMock extends UserService {
  getUser(): User {
    return new User('test name', 'test');
  }
}

let searchService: SearchService;
let httpSpy;
let http;
describe('SearchService', () => {
  beforeEach(() => {
    http = new Http(null, null);
    searchService = new SearchService(http, new UserServiceMock());
  });

  it('should be created', () => {
    expect(searchService).toBeTruthy();
  });

  it('should send the searchQuery to the api', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';

    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(new Response()));

    searchService.search(Observable.of(searchModel), new PageConfig()).subscribe(result => {
      console.log(result);
      expect(JSON.stringify(result)).toBe('{"results":[],"facets":{}}');
      expect(httpSpy).toHaveBeenCalledTimes(1);

      // args[1] is the payload
      expect(JSON.stringify(httpSpy.calls.first().args[1])).toBe('{"query":"iSearch","facets":[],"filters":[]}');
    });
  });
});
