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

    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized contentItem', () => {
    expect(component.contentObject.item).toEqual(defaultContentItem);
  });

  it('should have default pdf viewer settings applied', () => {
    expect(component.autoResize).toBeFalsy();
    expect(component.fitToPage).toBeTruthy();
    expect(component.fullScreen).toBeFalsy();
    expect(component.originalSize).toBeFalsy();
    expect(component.pageCount).toBe(1);
    expect(component.pageNumber).toBe(1);
    expect(component.autoResize).toBeFalsy();
    expect(component.renderText).toBeTruthy();
    expect(component.showAll).toBeFalsy();
    expect(component.stickToPage).toBeFalsy();
    expect(component.zoom).toBe(1.0);
  });

  it('should change the page count when display completes', () => {
    expect(component.pageCount).toBe(1);
    const pdf = {
      numPages: 10
    };
    component.onDisplayComplete(pdf);
    expect(component.pageCount).toBe(10);
  });

  it('should change the page number when page changes', () => {
    expect(component.pageNumber).toBe(1);
    component.onPageChanged(19);
    expect(component.pageNumber).toBe(19);
  });

  it('should update pdf viewer settings when zoom factor changes to actual size', () => {
    component.onZoomFactorChanged('actual-size');
    expect(component.autoResize).toBeFalsy();
    expect(component.fitToPage).toBeTruthy();
    expect(component.fullScreen).toBeFalsy();
    expect(component.originalSize).toBeTruthy();
    expect(component.pageCount).toBe(1);
    expect(component.pageNumber).toBe(1);
    expect(component.autoResize).toBeFalsy();
    expect(component.renderText).toBeTruthy();
    expect(component.showAll).toBeFalsy();
    expect(component.stickToPage).toBeFalsy();
    expect(component.zoom).toBe(1.0);
  });

  it('should update pdf viewer settings when zoom factor changes to automatic zoom', () => {
    component.onZoomFactorChanged('automatic-zoom');
    expect(component.autoResize).toBeTruthy();
    expect(component.fitToPage).toBeFalsy();
    expect(component.fullScreen).toBeFalsy();
    expect(component.originalSize).toBeFalsy();
    expect(component.pageCount).toBe(1);
    expect(component.pageNumber).toBe(1);
    expect(component.autoResize).toBeTruthy();
    expect(component.renderText).toBeTruthy();
    expect(component.showAll).toBeFalsy();
    expect(component.stickToPage).toBeFalsy();
    expect(component.zoom).toBe(1.0);
  });

  it('should update pdf viewer settings when zoom factor changes to 0.75', () => {
    component.onZoomFactorChanged('0.75');
    expect(component.autoResize).toBeFalsy();
    expect(component.fitToPage).toBeFalsy();
    expect(component.fullScreen).toBeFalsy();
    expect(component.originalSize).toBeFalsy();
    expect(component.pageCount).toBe(1);
    expect(component.pageNumber).toBe(1);
    expect(component.autoResize).toBeFalsy();
    expect(component.renderText).toBeTruthy();
    expect(component.showAll).toBeFalsy();
    expect(component.stickToPage).toBeFalsy();
    expect(component.zoom).toBe(0.75);
  });

  it('should build the url by delegating to the content service', () => {
    const webUrl = component.buildUrl('456');
    expect(webUrl).toBe('testUrl/456');
  });

  it('should stop the progress service when there is a display error', () => {
    const progressServiceSpy = spyOn(component.progressService, 'end');
    component.onDisplayError();
    expect(progressServiceSpy).toHaveBeenCalled();
  });

  it('should stop the progress service when image is loaded', () => {
    const progressServiceSpy = spyOn(component.progressService, 'end');
    component.onImageLoaded();
    expect(progressServiceSpy).toHaveBeenCalled();
  });

  it('should nudge the progress service when progress is made', () => {
    const progressServiceSpy = spyOn(component.progressService, 'progress');
    const progressData = {
      loaded: 90232
    };
    component.onDisplayProgress(progressData);
    expect(progressServiceSpy).toHaveBeenCalledWith(90232);
  });
});
