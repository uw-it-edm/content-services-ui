import { inject, TestBed } from '@angular/core/testing';

import { ContentService } from './content.service';
import { Http, HttpModule } from '@angular/http';
import { UserService } from '../user/user.service';
import { User } from '../user/user';

describe('ContentService', () => {
  class UserServiceMock extends UserService {
    getUser(): User {
      return new User('test name', 'test');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [ContentService, { provide: UserService, useValue: new UserServiceMock() }]
    });
  });

  it(
    'should be created',
    inject([ContentService, Http], (service: ContentService) => {
      expect(service).toBeTruthy();
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
        'content-api.dev/content/v3/file/123?rendition=Web&x-uw-act-as=test'
      );
    })
  );
});
