import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPagerComponent } from './content-pager.component';
import { MdButtonModule } from '@angular/material';
import { Router } from '@angular/router';
import { DataService } from '../../shared/providers/data.service';
import { ContentItem } from '../shared/model/content-item';
import { Observable } from 'rxjs/Observable';
import createSpy = jasmine.createSpy;

class MockDataService {
  storage = ['123', '1', '456'];
}

describe('ContentPagerComponent', () => {
  let component: ContentPagerComponent;
  let fixture: ComponentFixture<ContentPagerComponent>;
  const mockRouter = {
    navigate: createSpy('navigate')
  };

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [MdButtonModule],
        providers: [{ provide: Router, useValue: mockRouter }, { provide: DataService, useClass: MockDataService }],
        declarations: [ContentPagerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentPagerComponent);
    component = fixture.componentInstance;
    component.nextBaseUrl = '/test/edit/';
    const defaultContentItem = new ContentItem();
    defaultContentItem.id = '1';
    component.contentItem$ = Observable.of(defaultContentItem);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should populate adjacentIds from data storage', () => {
    expect(component.adjacentIds).toEqual(['123', '1', '456']);
  });
  it('should populate identify the currentPosition within adjacentIds', () => {
    expect(component.currentPosition).toEqual(1);
  });

  it('should navigate to the next contentItem', () => {
    component.navigate(2);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/edit/456'], { queryParamsHandling: 'merge' });
  });
});
