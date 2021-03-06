import { ContentService } from './content.service';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { ContentItem } from './model/content-item';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ProgressService } from '../../shared/providers/progress.service';
import { async } from '@angular/core/testing';
import { of } from 'rxjs';

let httpSpy;
let http: HttpClient;
let service: ContentService;
const readResponse = {
  id: '123',
  label: 'test.pdf',
  metadata: {
    ProfileId: 'Foster',
  },
};

class UserServiceMock extends UserService {
  constructor() {
    super(null, null, null);
  }

  getUser(): User {
    return new User('test');
  }
}

describe('ContentService', () => {
  beforeEach(() => {
    http = new HttpClient(null);
    service = new ContentService(http, new ProgressService(), new UserServiceMock());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should read from the content api', () => {
    httpSpy = spyOn(http, 'get').and.returnValue(of(readResponse));

    const expectedUrl = environment.content_api.url + environment.content_api.contextV3 + '/item/123';
    service.read('123').subscribe((result) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedUrl);
      expect(result.id).toBe('123');
      expect(result.label).toBe('test.pdf');
      expect(result.metadata['ProfileId']).toBe('Foster');
    });
  });

  it('should add web rendition to getFileUrl', () => {
    expect(service.getFileUrl({ itemId: '123', webViewable: true, useOriginalFilename: true })).toContain(
      'rendition=Web'
    );
  });
  it('should not web rendition to getFileUrl', () => {
    expect(service.getFileUrl({ itemId: '123', webViewable: false, useOriginalFilename: true })).not.toContain(
      'rendition=Web'
    );
  });
  it('should add useOriginalFilename to getFileUrl', () => {
    expect(service.getFileUrl({ itemId: '123', webViewable: true, useOriginalFilename: true })).toContain(
      'useOriginalFilename=true'
    );
  });
  it('should not useOriginalFilename to getFileUrl', () => {
    expect(service.getFileUrl({ itemId: '123', webViewable: false, useOriginalFilename: false })).not.toContain(
      'useOriginalFilename=true'
    );
  });
  it('should add disposition to getFileUrl', () => {
    expect(
      service.getFileUrl({
        itemId: '123',
        webViewable: false,
        useOriginalFilename: true,
        disposition: 'attachment',
      })
    ).toContain('disposition=attachment');
  });
  it('should get the file url', () => {
    const expectedUrl =
      environment.content_api.url +
      environment.content_api.contextV3 +
      '/file/123?rendition=Web&useOriginalFilename=true&auth=test';
    expect(service.getFileUrl({ itemId: '123', webViewable: true, useOriginalFilename: true })).toEqual(expectedUrl);
  });

  it('should update the content api', async(() => {
    httpSpy = spyOn(http, 'post').and.returnValue(of(readResponse));

    const contentItem = new ContentItem();
    contentItem.id = '123';
    const expectedUrl = environment.content_api.url + environment.content_api.contextV3 + '/item/123';

    service.update(contentItem, null).subscribe((result) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedUrl);
      expect(result.id).toEqual(contentItem.id);
    });
  }));
  it('should create content-items', async(() => {
    httpSpy = spyOn(http, 'post').and.returnValue(of(readResponse));
    const expectedUrl = environment.content_api.url + environment.content_api.contextV3 + '/item/';
    const contentItem = new ContentItem();
    contentItem.id = '123';

    service.create(contentItem, null).subscribe((result) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedUrl);
      expect(result.id).toEqual(contentItem.id);
    });
  }));
});
