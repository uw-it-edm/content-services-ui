import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { ProgressService } from '../../shared/providers/progress.service';
import { Config } from './model/config';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { TenantConfigInfo } from './model/tenant-config-info';
import { Field } from './model/field';
import { PageConfig } from './model/page-config';

let httpSpy;
let http: HttpClient;
let service: ConfigService;

const profileLinks = {
  _links: {
    demo: {
      href: 'http://profile-api-mock.edm/profile/v1/app/my-app/demo',
    },
    'mech-eng-procard': {
      href: 'http://profile-api-mock.edm/profile/v1/app/my-app/mech-eng-procard',
    },
  },
};

describe('ConfigService', () => {
  class UserServiceMock extends UserService {
    constructor() {
      super(null, null, null);
    }

    getUser(): User {
      return new User('test');
    }
  }

  beforeEach(() => {
    http = new HttpClient(null);
    service = new ConfigService(http, new ProgressService(), new UserServiceMock());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a Promise', () => {
    expect(service.getConfigForTenant('test')).toBeTruthy();
  });

  it('should getTenantList', (done: DoneFn) => {
    const response$ = of(profileLinks);
    httpSpy = spyOn(http, 'get').and.returnValue(response$);

    const expectedUrl = environment.profile_api.url + environment.profile_api.context + '/app/content-services-ui';
    service.getTenantList().subscribe((tenants: TenantConfigInfo[]) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedUrl);
      expect(tenants.length).toEqual(2);
      expect(tenants[0].tenantName).toBe('demo');
      expect(tenants[1].tenantName).toBe('mech-eng-procard');

      done();
    });
  });

  it('should have a Demo profile', (done: DoneFn) => {
    const demo = new Config();
    demo.tenant = 'demo';

    const profileLinksResponse$ = of(profileLinks);
    const tenantResponse$ = of(demo);
    httpSpy = spyOn(http, 'get').and.returnValues(profileLinksResponse$, tenantResponse$);

    const expectedUrl = profileLinks._links['demo'].href;
    service.getConfigForTenant('demo').then((demoConfig) => {
      expect(httpSpy).toHaveBeenCalledTimes(2);
      expect(httpSpy.calls.mostRecent().args[0]).toBe(expectedUrl);
      expect(demoConfig.tenant).toBe('demo');

      done();
    });
  });

  describe('with fieldReferencesToDisplay', () => {
    let config: Config;
    let pageConfig: PageConfig;

    beforeEach(() => {
      config = new Config();
      config.tenant = 'demo';
      config.availableFields = [
        Object.assign(new Field(), { key: 'field1', displayType: 'select' }),
        Object.assign(new Field(), { key: 'field2', displayType: 'multi-select' }),
        Object.assign(new Field(), { key: 'field3', displayType: 'filter-select' }),
      ];

      pageConfig = {
        pageName: 'page1',
        theme: 'theme1',
        fieldsToDisplay: null,
        fieldKeysToDisplay: null,
      };

      config.pages['page1'] = pageConfig;

      spyOn(http, 'get').and.returnValues(of(profileLinks), of(config));
    });

    it('should include fields specified by string key or object in references array', (done: DoneFn) => {
      pageConfig.fieldReferencesToDisplay = ['field1', { key: 'field2' }, 'field3'];

      service.getConfigForTenant('demo').then((demoConfig) => {
        const demoPage: PageConfig = demoConfig.pages['page1'];
        expect(demoPage.fieldsToDisplay.length).toEqual(3);

        expect(demoPage.fieldsToDisplay[0].displayType).toEqual('select');
        expect(demoPage.fieldsToDisplay[1].displayType).toEqual('multi-select');
        expect(demoPage.fieldsToDisplay[2].displayType).toEqual('filter-select');

        done();
      });
    });

    it('should override field properties specified on references array', (done: DoneFn) => {
      pageConfig.fieldReferencesToDisplay = [{ key: 'field1', override: { disabled: true } }];

      service.getConfigForTenant('demo').then((demoConfig) => {
        const demoPage: PageConfig = demoConfig.pages['page1'];
        expect(demoPage.fieldsToDisplay.length).toEqual(1);

        // verify 'disabled' property was overriden and 'displayType' was kept
        expect(demoPage.fieldsToDisplay[0].disabled).toBeTrue();
        expect(demoPage.fieldsToDisplay[0].displayType).toEqual('select');

        // verify 'disabled' property was not modified on the reference field
        expect(demoConfig.availableFields[0].disabled).toBeFalse();

        done();
      });
    });

    it('should throw exception if field reference is not found', (done: DoneFn) => {
      pageConfig.fieldReferencesToDisplay = ['invalid'];

      service.getConfigForTenant('demo').catch((reason) => {
        expect(reason.message).toEqual(`Field in page 'page1' referenced by key 'invalid' was not found.`);
        done();
      });
    });
  });
});
