import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentPagerComponent } from './content-pager.component';
import { MatButtonModule } from '@angular/material';
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
        imports: [MatButtonModule],
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
    component.contentItem = defaultContentItem;

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

  it('should contain buttons to page previous or next', () => {
    const button = fixture.debugElement.nativeElement.querySelectorAll('button');
    expect(button[0].id).toEqual('previousItem');
    expect(button[0].disabled).toBe(false);
    expect(button[1].id).toEqual('nextItem');
    expect(button[1].disabled).toBe(false);
  });

  it('should contain disabled buttons if no currentPosition', () => {
    component.currentPosition = undefined;
    fixture.detectChanges();
    const button = fixture.debugElement.nativeElement.querySelectorAll('button');
    expect(button[0].id).toEqual('previousItem');
    expect(button[0].disabled).toBe(true);
    expect(button[1].id).toEqual('nextItem');
    expect(button[1].disabled).toBe(true);
  });

  it('should contain disabled previous previous, if in first position', () => {
    component.currentPosition = 0;
    fixture.detectChanges();
    const button = fixture.debugElement.nativeElement.querySelectorAll('button');
    expect(button[0].id).toEqual('previousItem');
    expect(button[0].disabled).toBe(true);
    expect(button[1].id).toEqual('nextItem');
    expect(button[1].disabled).toBe(false);
  });

  it('should contain disabled next button, if in last position', () => {
    component.currentPosition = 2;
    fixture.detectChanges();
    const button = fixture.debugElement.nativeElement.querySelectorAll('button');
    expect(button[0].id).toEqual('previousItem');
    expect(button[0].disabled).toBe(false);
    expect(button[1].id).toEqual('nextItem');
    expect(button[1].disabled).toBe(true);
  });
});
