import { ContentService } from './content.service';
import { Http, HttpModule, Response, ResponseOptions } from '@angular/http';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { Observable } from 'rxjs/Observable';
import { inject, TestBed } from '@angular/core/testing';
import { ContentItem } from './model/content-item';

describe('ContentService', () => {
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
      imports: [HttpModule],
      providers: [
        ContentService,
        { provide: UserService, useValue: new UserServiceMock() },
        { provide: Http, useValue: new Http(null, null) }
      ]
    });
  });

  it('should be created', () =>
    inject([ContentService, Http], (service: ContentService) => {
      expect(service).toBeTruthy();
    }));

  it(
    'should read from the content api',
    inject([ContentService, Http], (service: ContentService, http: Http) => {
      const httpSpy = spyOn(http, 'get').and.callFake(function(_url, _options) {
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
    inject([ContentService, Http], (service: ContentService) => {
      expect(service.getFileUrl('123', true)).toContain('rendition=Web');
    })
  );
  it(
    'should not web rendition to getFileUrl',
    inject([ContentService, Http], (service: ContentService) => {
      expect(service.getFileUrl('123', false)).not.toContain('rendition=Web');
    })
  );
  it(
    'should to get the file url',
    inject([ContentService, Http], (service: ContentService) => {
      expect(service.getFileUrl('123', true)).toEqual(
        'http://content-api.dev/content/v3/file/123?rendition=Web&x-uw-act-as=test'
      );
    })
  );

  it(
    'should update the content api',
    inject([ContentService, Http], (service: ContentService, http: Http) => {
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
});
