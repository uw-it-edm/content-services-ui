import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { MatButtonModule, MatTooltipModule } from '@angular/material';
import { ContentToolbarComponent } from '../content-toolbar/content-toolbar.component';
import { FormsModule } from '@angular/forms';

describe('ContentToolbarComponent', () => {
  let component: ContentToolbarComponent;
  let fixture: ComponentFixture<ContentToolbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MatButtonModule, MatTooltipModule],
      providers: [],
      declarations: [ContentToolbarComponent, SafeUrlPipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentToolbarComponent);
    component = fixture.componentInstance;
    component.contentType = 'application/pdf';
    component.pageCount = 10;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
