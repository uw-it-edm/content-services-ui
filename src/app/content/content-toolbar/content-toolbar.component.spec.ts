import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';
import { ContentToolbarComponent } from '../content-toolbar/content-toolbar.component';
import { FormsModule } from '@angular/forms';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentToolbarComponent', () => {
  let component: ContentToolbarComponent;
  let fixture: ComponentFixture<ContentToolbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MaterialConfigModule, NoopAnimationsModule],
      providers: [],
      declarations: [ContentToolbarComponent, SafeUrlPipe],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentToolbarComponent);
    component = fixture.componentInstance;
    component.contentType = 'pdf';
    component.pageCount = 10;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should not set the page number higher than the page count', () => {
    component.pageNumber = 8;
    component.changePageNumber('109');
    expect(component.pageNumber).toBe(8);
  });

  it('should notify when page number is changed', () => {
    const payNumberChangeSpy = spyOn(component.pageNumberChange, 'emit');
    component.pageNumber = 5;
    expect(payNumberChangeSpy).toHaveBeenCalled();
    component.changePageNumber('9');
    expect(component.pageNumber).toBe(9);
    expect(payNumberChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should respond to page up and page down commands', () => {
    component.pageNumber = 1;
    component.pageDown();
    expect(component.pageNumber).toBe(2);
    component.pageUp();
    expect(component.pageNumber).toBe(1);
  });

  it('should toggle full screen correctly', () => {
    const fullScreenChangeSpy = spyOn(component.fullScreenChange, 'emit');
    component.toggleFullScreen();
    expect(fullScreenChangeSpy).toHaveBeenCalled();
    expect(component.fullScreen).toBeTruthy();
    component.toggleFullScreen();
    expect(fullScreenChangeSpy).toHaveBeenCalledTimes(2);
    expect(component.fullScreen).toBeFalsy();
  });

  it('should toggle show all correctly', () => {
    component.toggleShowAll();
    expect(component.showAll).toBeTruthy();
    component.toggleShowAll();
    expect(component.showAll).toBeFalsy();
  });

  it('should emit when zoom factor changes', () => {
    const zoomChangeSpy = spyOn(component.zoom, 'emit');
    component.changeZoomFactor('0.25');
    expect(zoomChangeSpy).toHaveBeenCalled();
  });

  it('should display zoom control when input field is true', () => {
    // by default zoom control is displayed.
    let zoomElement = fixture.debugElement.query(By.css('.cs-zoom-factor-select'));
    expect(zoomElement.nativeElement).toBeTruthy();

    // turn off zoom control and verify it is no longer displayed.
    component.allowZoom = false;
    fixture.detectChanges();

    zoomElement = fixture.debugElement.query(By.css('.cs-zoom-factor-select'));
    expect(zoomElement).toBeNull();
  });
});
