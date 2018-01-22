import { SearchService } from './search.service';
import { Response, ResponseOptions } from '@angular/http';
import { User } from '../../user/shared/user';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../user/shared/user.service';
import { SearchModel } from './model/search-model';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { FacetConfig } from '../../core/shared/model/facet-config';
import { SearchFilter } from './model/search-filter';
import { Field } from '../../core/shared/model/field';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../shared/providers/data.service';

class UserServiceMock extends UserService {
  constructor() {
    super(null, null);
  }

  getUser(): User {
    return new User('test');
  }
}

let searchService: SearchService;
let httpSpy;
let http;
describe('SearchService', () => {
  beforeEach(() => {
    http = new HttpClient(null);
    searchService = new SearchService(http, new UserServiceMock(), new DataService());
  });

  it('should be created', () => {
    expect(searchService).toBeTruthy();
  });

  it('should send the searchQuery to the api', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';

    httpSpy = spyOn(http, 'post').and.callFake(function(any, any2, any3) {
      return Observable.of({
        searchResults: [
          {
            metadata: {
              id: '1',
              label: 'myLabel1'
            }
          },
          {
            metadata: {
              id: '2',
              label: 'myLabel2'
            }
          }
        ],
        facets: [],
        from: 0,
        page: 0,
        pageSize: 50,
        totalCount: 155249,
        timeTaken: '13.0'
      });
    });

    searchService.search(Observable.of(searchModel), new SearchPageConfig()).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);

      // args[1] is the payload
      expect(JSON.stringify(httpSpy.calls.first().args[1])).toBe(
        '{"query":"iSearch","facets":[],"filters":[],"from":0,"page":0,"pageSize":50}'
      );
      expect(result.results.length).toBe(2);
      expect(result.results[1].metadata['id']).toBe('2');
      expect(result.results[1].metadata['label']).toBe('myLabel2');
      expect(result.facets.size).toBe(0);
      expect(result.total).toBe(155249);
    });
  });

  it('should add facets to the query payload', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';

    const pageConfig = new SearchPageConfig();
    pageConfig.facetsConfig.active = true;
    const facetConfig = new FacetConfig();
    facetConfig.size = 5;
    facetConfig.key = 'my-facet';
    facetConfig.order = 'asc';
    const facetConfig2 = new FacetConfig();
    facetConfig2.size = 15;
    facetConfig2.key = 'my-second-facet';
    facetConfig2.order = 'desc';

    pageConfig.facetsConfig.facets['my-facet'] = facetConfig;
    pageConfig.facetsConfig.facets['my-second-facet'] = facetConfig2;

    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(new Response(new ResponseOptions())));

    searchService.search(Observable.of(searchModel), pageConfig).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      // args[1] is the payload
      const payload = httpSpy.calls.first().args[1];

      expect(payload['query']).toBe('iSearch');
      expect(payload['facets'].length).toBe(2);
      expect(payload['facets'][0].field).toBe('my-facet');
      expect(payload['facets'][0].order).toBe('asc');
      expect(payload['facets'][0].size).toBe(5);
      expect(payload['facets'][1].field).toBe('my-second-facet');
      expect(payload['facets'][1].order).toBe('desc');
      expect(payload['facets'][1].size).toBe(15);
    });
  });

  it('should add filter to the query payload', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    searchModel.filters.push(new SearchFilter('my-filter', 'value', 'my-label'));
    searchModel.filters.push(new SearchFilter('my-second-filter', 'value2', 'my-label'));

    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(new Response(new ResponseOptions())));

    searchService.search(Observable.of(searchModel), new SearchPageConfig()).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      // args[1] is the payload
      const payload = httpSpy.calls.first().args[1];
      expect(payload['query']).toBe('iSearch');
      expect(payload['filters'].length).toBe(2);
      expect(payload['filters'][0].field).toBe('my-filter');
      expect(payload['filters'][0].term).toBe('value');
      expect(payload['filters'][1].field).toBe('my-second-filter');
      expect(payload['filters'][1].term).toBe('value2');
    });
  });

  it('should add pagination to the query payload', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    searchModel.pagination.pageSize = 25;
    searchModel.pagination.pageIndex = 2;

    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(new Response(new ResponseOptions())));

    searchService.search(Observable.of(searchModel), new SearchPageConfig()).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      // args[1] is the payload
      const payload = httpSpy.calls.first().args[1];
      expect(payload['query']).toBe('iSearch');
      expect(payload.pageSize).toEqual(25);
      expect(payload.page).toEqual(2);
      expect(payload.from).toEqual(50);
    });
  });

  it('should add metadata Ordering to the query payload', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    searchModel.order.term = 'myfield';
    searchModel.order.order = 'desc';

    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(new Response(new ResponseOptions())));

    searchService.search(Observable.of(searchModel), new SearchPageConfig()).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      // args[1] is the payload
      const payload = httpSpy.calls.first().args[1];
      expect(payload['query']).toBe('iSearch');
      expect(payload.searchOrder.term).toEqual('metadata.myfield');
      expect(payload.searchOrder.order).toEqual('desc');
    });
  });

  it('should add label Ordering to the query payload', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    searchModel.order.term = 'label';
    searchModel.order.order = 'desc';

    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(new Response(new ResponseOptions())));

    searchService.search(Observable.of(searchModel), new SearchPageConfig()).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      // args[1] is the payload
      const payload = httpSpy.calls.first().args[1];
      expect(payload['query']).toBe('iSearch');
      expect(payload.searchOrder.term).toEqual('label.lowercase');
      expect(payload.searchOrder.order).toEqual('desc');
    });
  });

  it('should add .lowercase to string field Ordering to the query payload', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    searchModel.order.term = 'myfield';
    searchModel.order.order = 'desc';

    const pageConfig = new SearchPageConfig();
    const field = new Field();
    field.key = 'myfield';
    pageConfig.fieldsToDisplay.push(field);

    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(new Response(new ResponseOptions())));

    searchService.search(Observable.of(searchModel), pageConfig).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      // args[1] is the payload
      const payload = httpSpy.calls.first().args[1];
      expect(payload['query']).toBe('iSearch');
      expect(payload.searchOrder.term).toEqual('metadata.myfield.lowercase');
      expect(payload.searchOrder.order).toEqual('desc');
    });
  });

  it('shouldnt add .lowercase to number field Ordering to the query payload', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    searchModel.order.term = 'myIntegerField';
    searchModel.order.order = 'desc';

    const pageConfig = new SearchPageConfig();
    const field = new Field();
    field.key = 'myIntegerField';
    field.dataType = 'number';
    pageConfig.fieldsToDisplay.push(field);

    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(new Response(new ResponseOptions())));

    searchService.search(Observable.of(searchModel), pageConfig).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      // args[1] is the payload
      const payload = httpSpy.calls.first().args[1];
      expect(payload['query']).toBe('iSearch');
      expect(payload.searchOrder.term).toEqual('metadata.myIntegerField');
      expect(payload.searchOrder.order).toEqual('desc');
    });
  });

  it('shouldnt add .lowercase to date field Ordering to the query payload', () => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    searchModel.order.term = 'myDateField';
    searchModel.order.order = 'desc';

    const pageConfig = new SearchPageConfig();
    const field = new Field();
    field.key = 'myDateField';
    field.dataType = 'date';
    pageConfig.fieldsToDisplay.push(field);

    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(new Response(new ResponseOptions())));

    searchService.search(Observable.of(searchModel), pageConfig).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      // args[1] is the payload
      const payload = httpSpy.calls.first().args[1];
      expect(payload['query']).toBe('iSearch');
      expect(payload.searchOrder.term).toEqual('metadata.myDateField');
      expect(payload.searchOrder.order).toEqual('desc');
    });
  });
});
