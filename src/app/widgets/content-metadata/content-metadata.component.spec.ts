import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentMetadataComponent } from './content-metadata.component';

describe('ContentMetadataComponent', () => {
  let component: ContentMetadataComponent;
  let fixture: ComponentFixture<ContentMetadataComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ContentMetadataComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
