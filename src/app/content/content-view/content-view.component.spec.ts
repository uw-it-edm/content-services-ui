import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentViewComponent } from './content-view.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { ContentItem } from '../shared/model/content-item';
import { Observable } from 'rxjs/Observable';
import { ContentService } from '../shared/content.service';
import { MatButtonModule } from '@angular/material';

class MockContentService {
  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }
}

describe('ContentViewComponent', () => {
  let component: ContentViewComponent;
  let fixture: ComponentFixture<ContentViewComponent>;
  let defaultContentItem: ContentItem;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatButtonModule],
      providers: [{ provide: ContentService, useClass: MockContentService }],
      declarations: [ContentViewComponent, PdfViewerComponent, SafeUrlPipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentViewComponent);
    component = fixture.componentInstance;

    defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata['MimeType'] = 'application/pdf';
    component.item$ = Observable.of(defaultContentItem);
    component.file$ = Observable.of(null);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized contentItemUrl', () => {
    expect(component.url).toBe('testUrl/1');
  });

  it('should have an initialized contentItem', () => {
    expect(component.item).toEqual(defaultContentItem);
  });
  it('should have an initialized pdfUrl dataType', () => {
    expect(component.dataType).toEqual('pdfUrl');
  });
  it('should have an initialized image dataType', () => {
    const contentItem2 = new ContentItem();
    contentItem2.id = '2';
    contentItem2.label = 'test label 2';
    contentItem2.metadata['MimeType'] = 'image/jpg';
    component.item$ = Observable.of(contentItem2);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.dataType).toEqual('image');
  });
  it('should have an initialized unknown dataType', () => {
    const contentItem2 = new ContentItem();
    contentItem2.id = '2';
    contentItem2.label = 'test label 2';
    contentItem2.metadata['MimeType'] = 'application/yml';
    component.item$ = Observable.of(contentItem2);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.dataType).toEqual('unknown');
  });
  it('should have an initialized unknown dataType when no MimeType is specified', () => {
    const contentItem2 = new ContentItem();
    contentItem2.id = '2';
    contentItem2.label = 'test label 2';
    component.item$ = Observable.of(contentItem2);
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.dataType).toEqual('unknown');
  });

  it('should have an identify pdf dataType from dataURI', () => {
    component.url = 'data:application/pdf:asdfasdfasdfasdfsad';
    component.determineUrlType();
    expect(component.dataType).toEqual('pdf');
  });
  it('should have an identify image dataType from dataURI', () => {
    component.url = 'data:image/jpeg:asdfasdfasdfasdfsad';
    component.determineUrlType();
    expect(component.dataType).toEqual('image');
  });
  it('should have an identify pdfUrl dataType from url', () => {
    component.url = 'http://asdfasdfasdfasdfsad';
    component.determineUrlType();
    expect(component.dataType).toEqual('pdfUrl');
  });
  it('should have an identify unkown dataType from dataURI', () => {
    component.url = 'data:application/unknown;asdfasdfasdfasdfsad';
    component.determineUrlType();
    expect(component.dataType).toEqual('unknown');
  });
});
