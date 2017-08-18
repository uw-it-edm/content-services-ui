import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericPageComponent } from './generic-page.component';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { Config } from '../../model/config';
import { PageConfig } from '../../model/page-config';


let activatedRoute: ActivatedRouteStub;
let component: GenericPageComponent;
let fixture: ComponentFixture<GenericPageComponent>;

describe('GenericPageComponent', () => {

  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialConfigModule],
      declarations: [GenericPageComponent],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRoute},
        Title,
      ]
    })
      .compileComponents();
  }));

  describe('when component is created and a correct config is sent', () => {
    beforeEach(async(() => {
      activatedRoute.testParamMap = {page: 'test-page'};

      const pageConfig = new PageConfig();
      pageConfig.pageName = 'test-page';

      const config = new Config();
      config.tenant = 'test-tenant';
      config.pages['test-page'] = pageConfig;

      console.log(JSON.stringify(config));
      activatedRoute.testData = {config: config};
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(GenericPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should be created', () => {
      expect(component).toBeTruthy();
    });


    it('should get a page config', () => {
      const app = fixture.debugElement.componentInstance;
      expect(app.pageConfig).toBeDefined();
    });

    it('should get a config', () => {
      const app = fixture.debugElement.componentInstance;
      expect(app.config).toBeDefined();
    });

    it('should have the title set to the page name', () => {
      const title = fixture.debugElement.injector.get(Title);
      expect(title.getTitle()).toBe('test-page');
    });
  });
});
