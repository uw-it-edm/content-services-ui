import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantComponent } from './tenant.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { Title } from '@angular/platform-browser';
import { Config } from '../../model/config';
import { GlobalEventsManagerService } from '../../services/global-events-manager.service';

let activatedRoute: ActivatedRouteStub;
let component: TenantComponent;
let fixture: ComponentFixture<TenantComponent>;

describe('TenantComponent', () => {

  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialConfigModule],
      declarations: [TenantComponent],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        Title,
        GlobalEventsManagerService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));


  describe('when component is created and a correct config is sent', () => {
    beforeEach(async(() => {
      activatedRoute.testParamMap = {tenant: 'test-tenant'};
      const config = new Config();
      config.tenant = 'test-tenant';
      activatedRoute.testData = {config: config};
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TenantComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

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
});

/*
function createComponent() {
  fixture = TestBed.createComponent(TenantComponent);
  component = fixture.componentInstance;

  // 1st change detection triggers ngOnInit which gets a hero
  fixture.detectChanges();
  return fixture.whenStable().then(() => {
    // 2nd change detection displays the async-fetched hero
    fixture.detectChanges();
  });
}
*/
