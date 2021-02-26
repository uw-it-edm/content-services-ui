import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { MaterialConfigModule } from '../../../routing/material-config.module';
import { ConfigService } from '../../../core/shared/config.service';
import { GlobalEventsManagerService } from '../../../core/shared/global-events-manager.service';
import { UserService } from '../../../user/shared/user.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigResolver } from '../../../routing/shared/config-resolver.service';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../../testing/router-stubs';
import { HttpClientModule } from '@angular/common/http';
import { ProgressService } from '../../providers/progress.service';
import { NotificationService } from '../../providers/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { User } from '../../../user/shared/user';
import { ApplicationStateService } from './../../providers/application-state.service';

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

class MockUserService extends UserService {
  constructor() {
    super(null, null, null);
  }

  getUserObservable(): Observable<User> {
    return of(new User('testUser'));
  }
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let activatedRoute: ActivatedRouteStub;
  let configServiceStub: ConfigServiceStub;

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    configServiceStub = new ConfigServiceStub();

    TestBed.configureTestingModule({
      imports: [MaterialConfigModule, HttpClientModule, NoopAnimationsModule],
      declarations: [HeaderComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useClass: RouterStub },
        { provide: ConfigService, useValue: configServiceStub },
        { provide: UserService, useValue: new MockUserService() },
        ConfigResolver,
        ApplicationStateService,
        GlobalEventsManagerService,
        ProgressService,
        NotificationService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

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
    const routeParams = { tenant: 'test-tenant' };
    route.params = routeParams;
    inject([ConfigResolver], (service: ConfigResolver) => {
      service.resolve(route, null).then((config) => {
        expect(component.accountMenu.items.length).toBeGreaterThanOrEqual(4);
      });
    });
  });
});
