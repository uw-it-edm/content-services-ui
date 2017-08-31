import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPageComponent } from './edit-page.component';
import { ContentMetadataComponent } from '../../widgets/content-metadata/content-metadata.component';
import { ContentViewComponent } from '../../widgets/content-view/content-view.component';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { HttpModule } from '@angular/http';
import { ActivatedRouteStub } from '../../../testing/router-stubs';

describe('EditPageComponent', () => {
  let component: EditPageComponent;
  let fixture: ComponentFixture<EditPageComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [EditPageComponent, ContentMetadataComponent, ContentViewComponent],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
