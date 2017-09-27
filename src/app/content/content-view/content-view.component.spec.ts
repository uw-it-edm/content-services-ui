import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentViewComponent } from './content-view.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { ContentItem } from '../shared/model/content-item';
import { Observable } from 'rxjs/Observable';

describe('ContentViewComponent', () => {
  let component: ContentViewComponent;
  let fixture: ComponentFixture<ContentViewComponent>;
  let defaultContentItem: ContentItem;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ContentViewComponent, PdfViewerComponent, SafeUrlPipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentViewComponent);
    component = fixture.componentInstance;

    defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    component.item$ = Observable.of(defaultContentItem);
    component.url$ = Observable.of('testUrl');

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized contentItemUrl', () => {
    expect(component.url).toBe('testUrl');
  });

  it('should have an initialized contentItem', () => {
    expect(component.item).toEqual(defaultContentItem);
  });
});
