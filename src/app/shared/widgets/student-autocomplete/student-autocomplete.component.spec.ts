import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAutocompleteComponent } from './student-autocomplete.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { StudentService } from '../../providers/student.service';
import { StudentSearchModel } from '../../shared/model/student-search-model';
import { StudentSearchResults } from '../../shared/model/student-search-results';
import { A11yModule } from '@angular/cdk/a11y';

class MockStudentService {
  search(searchModel$: Observable<StudentSearchModel>): Observable<StudentSearchResults> {
    const studentSearchResults = new StudentSearchResults();
    return Observable.of(studentSearchResults);
  }
}

describe('StudentAutocompleteComponent', () => {
  let component: StudentAutocompleteComponent;
  let fixture: ComponentFixture<StudentAutocompleteComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, MatAutocompleteModule, A11yModule],
        declarations: [StudentAutocompleteComponent],
        providers: [{ provide: StudentService, useValue: new MockStudentService() }]
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
