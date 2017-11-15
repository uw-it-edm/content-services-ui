import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAutocompleteComponent } from './student-autocomplete.component';

describe('StudentAutocompleteComponent', () => {
  let component: StudentAutocompleteComponent;
  let fixture: ComponentFixture<StudentAutocompleteComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [StudentAutocompleteComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
