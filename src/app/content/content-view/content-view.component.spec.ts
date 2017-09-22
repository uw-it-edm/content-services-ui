import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentViewComponent } from './content-view.component';
import { SafeUrlPipe } from '../../util/safe-url.pipe';
import { PdfViewerComponent } from 'ng2-pdf-viewer';

describe('ContentViewComponent', () => {
  let component: ContentViewComponent;
  let fixture: ComponentFixture<ContentViewComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [],
        declarations: [ContentViewComponent, PdfViewerComponent, SafeUrlPipe]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentViewComponent);
    component = fixture.componentInstance;
    component.inputUrl = 'testUrl';
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized inputUrl', () => {
    expect((component.inputUrl = 'testUrl'));
  });
});
