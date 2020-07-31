import { async, inject, TestBed } from '@angular/core/testing';
import { Component, Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigResolver } from '../../../routing/shared/config-resolver.service';
import { CustomTextItem } from '../../../core/shared/model/config';
import { Observable, of } from 'rxjs';
import { CustomTextDirective } from './custom-text.directive';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

class RouterStub {
  navigate(url: string) {
    return url;
  }
}

class ConfigResolverStub {
  description = 'Test Description';
  label = 'Test Label';

  getCustomTextSubject(): Observable<Map<string, CustomTextItem>> {
    const customText = new Map<string, CustomTextItem>();
    const testButton = new CustomTextItem();
    testButton.label = this.label;
    testButton.description = this.description;
    customText['testButton'] = testButton;

    return of(customText);
  }
}

@Component({
  selector: 'app-test-component',
  template: '<div appCustomText="testButton" defaultValue="none"></div>',
})
class TestComponent {}

describe('CustomTextDirective', () => {
  let configResolverStub: ConfigResolverStub;

  beforeEach(async(() => {
    configResolverStub = new ConfigResolverStub();

    TestBed.configureTestingModule({
      imports: [],
      declarations: [CustomTextDirective, TestComponent],
      providers: [
        { provide: ConfigResolver, useValue: configResolverStub },
        { provide: Router, useClass: RouterStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  let configResolverService: ConfigResolverStub;
  beforeEach(async(() => {
    inject([Injector], (injector) => {
      configResolverService = injector.get(ConfigResolver);
    });

    TestBed.overrideComponent(TestComponent, {
      set: {
        template: '<div appCustomText="testButton" defaultValue="none"></div>',
      },
    });

    return TestBed.compileComponents();
  }));

  it('should replace text and title attribute correctly', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    const directiveEl = fixture.debugElement.query(By.directive(CustomTextDirective));
    expect(directiveEl).not.toBeNull();

    const directiveInstance = directiveEl.injector.get(CustomTextDirective);
    expect(directiveInstance.appCustomText).toBe('testButton');

    expect(fixture.debugElement.nativeElement.innerHTML).toContain('Test Label');
    expect(directiveEl.attributes.title).toBe('Test Description');
  });

  it('should not add title attribute if description is not defined', () => {
    configResolverStub.description = null;

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const directiveEl = fixture.debugElement.query(By.directive(CustomTextDirective));
    const directiveInstance = directiveEl.injector.get(CustomTextDirective);
    expect(directiveInstance.appCustomText).toBe('testButton');
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('Test Label');
    expect(directiveEl.attributes.title).toBeUndefined();
  });
});
