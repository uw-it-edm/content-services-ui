import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TenantComponent} from './tenant.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MaterialConfigModule} from '../../routing/material-config.module';
import {ActivatedRouteStub} from '../../../testing/router-stubs';
import {Title} from '@angular/platform-browser';
import {Config} from '../../core/shared/model/config';
import {GlobalEventsManagerService} from '../../core/shared/global-events-manager.service';

let activatedRoute: ActivatedRouteStub;
let component: TenantComponent;
let fixture: ComponentFixture<TenantComponent>;

describe('TenantComponent', () => {
  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();

    TestBed.configureTestingModule({
      imports: [MaterialConfigModule],
      declarations: [TenantComponent],
      providers: [{provide: ActivatedRoute, useValue: activatedRoute}, Title, GlobalEventsManagerService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    activatedRoute.testParamMap = {tenant: 'test-tenant'};
    const config = new Config();
    config.tenant = 'test-tenant';
    activatedRoute.testData = {config: config};

    fixture = TestBed.createComponent(TenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should get a tenant', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app.tenant).toEqual('test-tenant');
  });

  it('should get a config', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app.config).toBeDefined();
  });

  it('should have the title set to the name of the tenant', () => {
    const title = fixture.debugElement.injector.get(Title);
    expect(title.getTitle()).toBe('test-tenant');
  });

});
