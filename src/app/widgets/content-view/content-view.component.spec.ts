import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentViewComponent } from './content-view.component';

describe('ContentViewComponent', () => {
  let component: ContentViewComponent;
  let fixture: ComponentFixture<ContentViewComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ContentViewComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
