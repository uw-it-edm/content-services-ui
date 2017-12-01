import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentViewComponent } from './content-view.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ContentItem } from '../shared/model/content-item';
import { Observable } from 'rxjs/Observable';
import { ContentService } from '../shared/content.service';
import { MatButtonModule, MatTooltipModule } from '@angular/material';
import { ContentObject } from '../shared/model/content-object';
import { ContentToolbarComponent } from '../content-toolbar/content-toolbar.component';
import { FormsModule } from '@angular/forms';
import { ProgressService } from '../../shared/providers/progress.service';

class MockContentService {
  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }
}

describe('ContentViewComponent', () => {
  let component: ContentViewComponent;
  let fixture: ComponentFixture<ContentViewComponent>;
  let defaultContentItem: ContentItem;
  let contentObject: ContentObject;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MatButtonModule, MatTooltipModule, PdfViewerModule],
      providers: [{ provide: ContentService, useClass: MockContentService }, ProgressService],
      declarations: [ContentToolbarComponent, ContentViewComponent, SafeUrlPipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentViewComponent);
    component = fixture.componentInstance;

    defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata['MimeType'] = 'application/pdf';

    contentObject = new ContentObject(defaultContentItem);
    component.contentObject = contentObject;

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized contentItem', () => {
    expect(component.contentObject.item).toEqual(defaultContentItem);
  });
});
