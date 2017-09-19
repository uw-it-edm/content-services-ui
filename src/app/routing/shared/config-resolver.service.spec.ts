import { async, inject, TestBed } from '@angular/core/testing';

import { ConfigResolver } from './config-resolver.service';
import { ConfigService } from '../../core/shared/config.service';
import { Config } from '../../core/shared/model/config';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Injector } from '@angular/core';

class RouterStub {
  navigate(url: string) {
    return url;
  }
}

class MockConfigService {
  getConfigForTenant(tenant: string): Promise<Config> {
    let config: Config;
    if (tenant === 'test-tenant') {
      config = new Config();
      config.tenant = 'test-tenant';
    } else {
      config = null;
    }
    return Promise.resolve(config);
  }
}

describe('ConfigResolverService', () => {
  beforeEach(
    async(() => {
      const _mockConfigService = new MockConfigService();
      TestBed.configureTestingModule({
        providers: [
          ConfigResolver,
          { provide: ConfigService, useValue: _mockConfigService },
          { provide: Router, useClass: RouterStub }
        ]
      });
    })
  );

  /*
    beforeEach(inject([ConfigService], (_ConfigService) => {
      mockConfigService = _ConfigService;
    }));
  */

  let mockConfigService: MockConfigService;
  beforeEach(
    inject([Injector], injector => {
      mockConfigService = injector.get(ConfigService);
    })
  );

  it(
    'should be created',
    inject([ConfigResolver], (configResolverService: ConfigResolver) => {
      expect(configResolverService).toBeTruthy();
    })
  );

  it(
    'should call config service with the correct tenant',
    inject([ConfigResolver], (service: ConfigResolver) => {
      const route = new ActivatedRouteSnapshot();
      const routeParams = { tenant: 'test-tenant' };
      route.params = routeParams;
      service.resolve(route, null).then(config => {
        expect(config.tenant).toBe('test-tenant');
      });
    })
  );

  it(
    'should return null if tenant doesnt exist',
    inject([ConfigResolver], (service: ConfigResolver) => {
      // TODO spyOn router and check that we call router.navigate
      const route = new ActivatedRouteSnapshot();
      const routeParams = { tenant: 'fsdfsd-tenant' };
      route.params = routeParams;
      service.resolve(route, null).then(config => {
        expect(config.tenant).toBeNull();
      });
    })
  );
});
