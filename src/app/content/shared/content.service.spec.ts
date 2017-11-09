import { ContentService } from './content.service';
import { Response, ResponseOptions } from '@angular/http';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { Observable } from 'rxjs/Observable';
import { inject, TestBed } from '@angular/core/testing';
import { ContentItem } from './model/content-item';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';

describe('ContentService', () => {
  let testContentItem: ContentItem;

  class UserServiceMock extends UserService {
    constructor() {
      super(null);
    }

    getUser(): User {
      return new User('test');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        ContentService,
        { provide: UserService, useValue: new UserServiceMock() },
        { provide: HttpClient, useValue: new HttpClient(null) }
      ]
    });
  });
  beforeEach(() => {
    testContentItem = new ContentItem();
    testContentItem.id = '123';
    testContentItem.label = 'test.pdf';
    testContentItem.metadata['ProfileId'] = 'test';
  });
  it('should be created', () =>
    inject([ContentService, HttpClient], (service: ContentService) => {
      expect(service).toBeTruthy();
    }));

  it(
    'should read from the content api',
    inject([ContentService, HttpClient], (service: ContentService, http: HttpClient) => {
      const httpSpy = spyOn(http, 'get').and.callFake(function(_url, _options) {
        return Observable.of(testContentItem);
      });

      service.read('123').subscribe(result => {
        expect(httpSpy).toHaveBeenCalledTimes(1);

        expect(result.id).toBe('123');
        expect(result.label).toBe('test.pdf');
        expect(result.metadata['ProfileId']).toBe('test');
      });
    })
  );

  it(
    'should add web rendition to getFileUrl',
    inject([ContentService, HttpClient], (service: ContentService) => {
      expect(service.getFileUrl('123', true)).toContain('rendition=Web');
    })
  );
  it(
    'should not web rendition to getFileUrl',
    inject([ContentService, HttpClient], (service: ContentService) => {
      expect(service.getFileUrl('123', false)).not.toContain('rendition=Web');
    })
  );
  it(
    'should to get the file url',
    inject([ContentService, HttpClient], (service: ContentService) => {
      expect(service.getFileUrl('123', true)).toEqual(
        environment.content_api.url + '/content/v3/file/123?rendition=Web&auth=test'
      );
    })
  );

  it(
    'should update the content api',
    inject([ContentService, HttpClient], (service: ContentService, http: HttpClient) => {
      const httpSpy = spyOn(http, 'post').and.callFake(function(_url, _options) {
        return Observable.of(
          new Response(
            new ResponseOptions({
              body: JSON.stringify({
                id: '123',
                label: 'test.pdf',
                metadata: {
                  ProfileId: 'test'
                }
              }),
              status: 200
            })
          )
        );
      });
      const contentItem = new ContentItem();

      service.update(contentItem).subscribe(result => {
        expect(httpSpy).toHaveBeenCalledTimes(1);
      });
    })
  );
  it(
    'should create content-items',
    inject([ContentService, HttpClient], (service: ContentService, http: HttpClient) => {
      const httpSpy = spyOn(http, 'post').and.callFake(function(_url, _options) {
        return Observable.of(
          new Response(
            new ResponseOptions({
              body: JSON.stringify({
                id: '123',
                label: 'test.pdf',
                metadata: {
                  ProfileId: 'test'
                }
              }),
              status: 200
            })
          )
        );
      });
      const contentItem = new ContentItem();

      service.create(contentItem, null).subscribe(result => {
        expect(httpSpy).toHaveBeenCalledTimes(1);
      });
    })
  );
});
