import { TestBed, async, inject } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProgressService } from './shared/providers/progress.service';
import { ApplicationStateService } from './shared/providers/application-state.service';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [ProgressService, ApplicationStateService, { provide: Angulartics2GoogleTagManager, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app');
  }));

  it('should display warning header message when set', inject([ApplicationStateService], (appStateService: ApplicationStateService) => {
    const fixture = TestBed.createComponent(AppComponent);
    const app: AppComponent = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app');

    // Verify that by default the app has no warning message.
    let headerDiv = fixture.debugElement.query(By.css('.header-warning-message'));
    expect(headerDiv).toBeNull();

    // Set the warning message and verify that element appears.
    appStateService.setWarningHeaderMessage('test header message');
    fixture.detectChanges();

    headerDiv = fixture.debugElement.query(By.css('.header-warning-message'));
    expect(headerDiv.nativeElement.textContent).toContain('test header message');
  }));
});
