import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { MaterialConfigModule } from '../../../routing/material-config.module';
import { ConfigService } from '../../../core/shared/config.service';
import { GlobalEventsManagerService } from '../../../core/shared/global-events-manager.service';
import { UserService } from '../../../user/shared/user.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigResolver } from '../../../routing/shared/config-resolver.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../testing/router-stubs';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

class RouterStub {
  navigate(url: string) {
    return url;
  }
}

class ConfigServiceStub {
  getTenantList(): Promise<string[]> {
    return Promise.resolve(Array.from(['demo', 'one', 'two', 'three']));
  }
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let activatedRoute: ActivatedRouteStub;
  let configServiceStub: ConfigServiceStub;

  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    configServiceStub = new ConfigServiceStub();
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [MaterialConfigModule, HttpClientModule, HttpModule],
        declarations: [HeaderComponent],
        providers: [
          {provide: ActivatedRoute, useValue: activatedRoute},
          {provide: Router, useClass: RouterStub},
          {provide: ConfigService, useValue: configServiceStub},
          ConfigResolver,
          GlobalEventsManagerService,
          UserService
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should contain accounts in the account menu', () => {
    const route = new ActivatedRouteSnapshot();
    const routeParams = {tenant: 'test-tenant'};
    route.params = routeParams;
    inject([ConfigResolver], (service: ConfigResolver) => {
      service.resolve(route, null).then(config => {
        expect(component.accountMenu.items.length).toBeGreaterThanOrEqual(4);
      });
    });
  });
});
