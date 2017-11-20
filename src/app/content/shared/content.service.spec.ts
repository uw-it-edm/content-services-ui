import { ContentService } from './content.service';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { Observable } from 'rxjs/Observable';
import { ContentItem } from './model/content-item';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

let httpSpy;
let http: HttpClient;
let service: ContentService;
const readResponse = {
  id: '123',
  label: 'test.pdf',
  metadata: {
    ProfileId: 'Foster'
  }
};

class UserServiceMock extends UserService {
  constructor() {
    super(null);
  }

  getUser(): User {
    return new User('test');
  }
}

describe('ContentService', () => {
  beforeEach(() => {
    http = new HttpClient(null);
    service = new ContentService(http, new UserServiceMock());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should read from the content api', () => {
    httpSpy = spyOn(http, 'get').and.returnValue(Observable.of(readResponse));

    const expectedUrl = environment.content_api.url + environment.content_api.contextV3 + '/item/123';
    service.read('123').subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedUrl);
      expect(result.id).toBe('123');
      expect(result.label).toBe('test.pdf');
      expect(result.metadata['ProfileId']).toBe('Foster');
    });
  });

  it('should add web rendition to getFileUrl', () => {
    expect(service.getFileUrl('123', true)).toContain('rendition=Web');
  });
  it('should not web rendition to getFileUrl', () => {
    expect(service.getFileUrl('123', false)).not.toContain('rendition=Web');
  });
  it('should to get the file url', () => {
    const expectedUrl =
      environment.content_api.url + environment.content_api.contextV3 + '/file/123?rendition=Web&auth=test';
    expect(service.getFileUrl('123', true)).toEqual(expectedUrl);
  });

  it('should update the content api', () => {
    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(readResponse));

    const contentItem = new ContentItem();
    contentItem.id = '123';
    const expectedUrl = environment.content_api.url + environment.content_api.contextV3 + '/item/123';

    service.update(contentItem).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedUrl);
      expect(result.id).toEqual(contentItem.id);
    });
  });
  it('should create content-items', () => {
    httpSpy = spyOn(http, 'post').and.returnValue(Observable.of(readResponse));
    const expectedUrl = environment.content_api.url + environment.content_api.contextV3 + '/item/';
    const contentItem = new ContentItem();
    contentItem.id = '123';

    service.create(contentItem, null).subscribe(result => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedUrl);
      expect(result.id).toEqual(contentItem.id);
    });
  });
});
