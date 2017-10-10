import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ConfigService } from '../../../core/shared/config.service';
import { Component, Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigResolver } from '../../../routing/shared/config-resolver.service';
import { CustomTextItem } from '../../../core/shared/model/config';
import { Observable } from 'rxjs/Observable';
import { CustomTextDirective } from './custom-text.directive';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

class RouterStub {
  navigate(url: string) {
    return url;
  }
}

class ConfigResolverStub {
  getCustomTextSubject(): Observable<Map<string, CustomTextItem>> {
    const customText = new Map<string, CustomTextItem>();
    const testButton = new CustomTextItem();
    testButton.label = 'Test Label';
    testButton.description = 'Test Description';
    customText['testButton'] = testButton;

    return Observable.of(customText);
  }
}

@Component({
  selector: 'app-test-component',
  template: '<div appCustomText="testButton" defaultValue="none"></div>'
})
class TestComponent {}

describe('CustomTextDirective', () => {
  beforeEach(
    async(() => {
      const _configResolverStub = new ConfigResolverStub();

      TestBed.configureTestingModule({
        imports: [],
        declarations: [CustomTextDirective, TestComponent],
        providers: [
          { provide: ConfigResolver, useValue: _configResolverStub },
          { provide: Router, useClass: RouterStub }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  let configResolverService: ConfigResolverStub;
  beforeEach(() => {
    inject([Injector], injector => {
      configResolverService = injector.get(ConfigResolver);
    });
  });

  it(
    'should replace text and title attribute correctly',
    async(() => {
      TestBed.overrideComponent(TestComponent, {
        set: {
          template: '<div appCustomText="testButton" defaultValue="none"></div>'
        }
      });

      TestBed.compileComponents().then(() => {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        const directiveEl = fixture.debugElement.query(By.directive(CustomTextDirective));
        expect(directiveEl).not.toBeNull();

        const directiveInstance = directiveEl.injector.get(CustomTextDirective);
        expect(directiveInstance.appCustomText).toBe('testButton');

        expect(fixture.debugElement.nativeElement.innerHTML).toContain('Test Label');
        expect(directiveEl.attributes.title).toBe('Test Description');
      });
    })
  );
});
