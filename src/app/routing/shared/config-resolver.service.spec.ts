import { async, inject, TestBed } from '@angular/core/testing';

import { ConfigResolver } from './config-resolver.service';
import { ConfigService } from '../../core/shared/config.service';
import { ApplicationStateService } from '../../shared/providers/application-state.service';
import { Config } from '../../core/shared/model/config';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Injector } from '@angular/core';
import { NotificationService } from '../../shared/providers/notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
      config.warningHeaderMessage = 'test warning header message';
    } else {
      config = null;
    }
    return Promise.resolve(config);
  }
}

describe('ConfigResolverService', () => {
  let appStateServiceSpy: ApplicationStateService;

  beforeEach(async(() => {
    const _mockConfigService = new MockConfigService();
    appStateServiceSpy = jasmine.createSpyObj('ApplicationStateService', ['setWarningHeaderMessage']);

    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        ConfigResolver,
        { provide: ApplicationStateService, useValue: appStateServiceSpy },
        { provide: ConfigService, useValue: _mockConfigService },
        { provide: Router, useClass: RouterStub },
        NotificationService,
      ],
    }).compileComponents();
  }));

  let mockConfigService: MockConfigService;
  beforeEach(inject([Injector], (injector) => {
    mockConfigService = injector.get(ConfigService);
  }));

  it('should be created', inject([ConfigResolver], (configResolverService: ConfigResolver) => {
    expect(configResolverService).toBeTruthy();
  }));

  it('should call config service with the correct tenant and set warning header message', inject(
    [ConfigResolver],
    (service: ConfigResolver) => {
      const route = new ActivatedRouteSnapshot();
      const routeParams = { tenant: 'test-tenant' };
      route.params = routeParams;
      service.resolve(route, null).then((config) => {
        expect(config.tenant).toBe('test-tenant');
        expect(appStateServiceSpy.setWarningHeaderMessage).toHaveBeenCalledWith('test warning header message');
      });
    }
  ));

  it('should return null if tenant doesnt exist', inject([ConfigResolver], (service: ConfigResolver) => {
    const route = new ActivatedRouteSnapshot();
    const routeParams = { tenant: 'fsdfsd-tenant' };
    route.params = routeParams;
    service.resolve(route, null).then((config) => {
      expect(config.tenant).toBeNull();
    });
  }));
});
