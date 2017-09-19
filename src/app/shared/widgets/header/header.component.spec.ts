import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { MaterialConfigModule } from '../../../routing/material-config.module';
import { ConfigService } from '../../../core/shared/config.service';
import { GlobalEventsManagerService } from '../../../core/shared/global-events-manager.service';
import { UserService } from '../../../user/shared/user.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [MaterialConfigModule],
        declarations: [HeaderComponent],
        providers: [ConfigService, GlobalEventsManagerService, UserService],
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
});
