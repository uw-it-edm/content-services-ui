import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { PageNotFoundComponent } from './page-not-found.component';
import { ConfigService } from '../core/shared/config.service';
import { UserService } from '../user/shared/user.service';
import { TenantConfigInfo } from '../core/shared/model/tenant-config-info';
import { Injector } from '@angular/core';
import { User } from '../user/shared/user';
import { Observable, ReplaySubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRouteStub } from '../../testing/router-stubs';
import { MaterialConfigModule } from './material-config.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('PageNotFoundComponent', () => {
  let activatedRoute: ActivatedRouteStub;
  let component: PageNotFoundComponent;
  let fixture: ComponentFixture<PageNotFoundComponent>;

  class MockConfigService {
    getSupportEmail(): string {
      return 'support@nowhere.com';
    }

    getTenantList(): Observable<TenantConfigInfo[]> {
      const tenant = new TenantConfigInfo('test', 'http://test.com/test');
      let tenants: TenantConfigInfo[];
      tenants = [tenant];
      const subject = new ReplaySubject<TenantConfigInfo[]>();
      subject.next(tenants);
      return subject;
    }
  }

  class MockUserService {
    getUserObservable(): Observable<User> {
      const user = new User('testuser');
      const subject = new ReplaySubject<User>();
      subject.next(user);
      return subject;
    }
  }

  class RouterStub {
    navigate(url: string) {
      return url;
    }
  }

  beforeEach(async(() => {
    const _mockConfigService = new MockConfigService();
    const _mockUserService = new MockUserService();
    activatedRoute = new ActivatedRouteStub();
    TestBed.configureTestingModule({
      imports: [MaterialConfigModule, NoopAnimationsModule, RouterTestingModule],
      providers: [
        { provide: ConfigService, useValue: _mockConfigService },
        { provide: UserService, useValue: _mockUserService }
      ],
      declarations: [PageNotFoundComponent]
    });
  }));

  let mockConfigService: MockConfigService;
  let mockUserService: MockUserService;
  beforeEach(inject([Injector], injector => {
    mockConfigService = injector.get(ConfigService);
    mockUserService = injector.get(UserService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNotFoundComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should contain the test tenant', () => {
    expect(component.tenants[0].tenantName).toBe('test');
  });

  it('should have the correct support email', () => {
    expect(component.supportEmail).toBe('support@nowhere.com');
  });
});
