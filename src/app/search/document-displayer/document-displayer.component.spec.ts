import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MaterialConfigModule } from '../../routing/material-config.module';

import { DocumentDisplayerComponent } from './document-displayer.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { ContentItem } from '../../content/shared/model/content-item';
import { ContentService } from '../../content/shared/content.service';

class MockContentService {
  read(itemId: string): Observable<ContentItem> {
    const defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    defaultContentItem.label = 'test label';
    defaultContentItem.metadata['1'] = 'one';
    defaultContentItem.metadata['2'] = 'two';
    defaultContentItem.metadata['3'] = 'three';
    defaultContentItem.metadata['a'] = 'a';
    defaultContentItem.metadata['b'] = 'asdf';
    defaultContentItem.metadata['t'] = 't';
    return of(defaultContentItem);
  }

  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }
}

describe('DocumentDisplayerComponent', () => {
  let component: DocumentDisplayerComponent;
  let fixture: ComponentFixture<DocumentDisplayerComponent>;

  let mockContentService: MockContentService;

  beforeEach(() => {
    mockContentService = new MockContentService();
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MaterialConfigModule, BrowserModule],
      declarations: [DocumentDisplayerComponent],
      providers: [{ provide: ContentService, useValue: mockContentService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDisplayerComponent);
    component = fixture.componentInstance;

    component.itemId = '1234';

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized searchModel ', () => {
    expect(component.itemId).toBe('1234');
  });
});
