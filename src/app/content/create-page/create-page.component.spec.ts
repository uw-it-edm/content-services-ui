import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePageComponent } from './create-page.component';
import { HttpModule } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../shared/content.service';
import { Title } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { Observable } from 'rxjs/Observable';
import { ContentItem } from '../shared/model/content-item';
import { ContentMetadataComponent } from '../content-metadata/content-metadata.component';
import { ContentViewComponent } from '../content-view/content-view.component';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

// TODO: Should we be creating a seperate shared MockContentService? or just copy pasting
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
    return Observable.of(defaultContentItem);
  }

  getFileUrl(itemId: string, webViewable: boolean): string {
    return 'testUrl/' + itemId;
  }

  update(contentItem: ContentItem, file?: File): Observable<ContentItem> {
    return Observable.of(contentItem);
  }
}

describe('CreatePageComponent', () => {
  let component: CreatePageComponent;
  let fixture: ComponentFixture<CreatePageComponent>;
  let activatedRoute: ActivatedRouteStub;
  let mockContentService: MockContentService;

  beforeEach(() => {
    activatedRoute = new ActivatedRouteStub();
    mockContentService = new MockContentService();
  });

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [HttpModule],
        declarations: [CreatePageComponent, ContentMetadataComponent, ContentViewComponent, SafeUrlPipe],
        providers: [
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: ContentService, useValue: mockContentService },
          Title,
          FormBuilder
        ],
        schemas: [NO_ERRORS_SCHEMA]
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(CreatePageComponent);
          component = fixture.componentInstance;
        });
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
