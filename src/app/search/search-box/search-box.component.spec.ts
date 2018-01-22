import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBoxComponent } from './search-box.component';
import { FormsModule } from '@angular/forms';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { Observable } from 'rxjs/Observable';
import { SearchModel } from '../shared/model/search-model';
import 'rxjs/add/observable/of';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Student } from '../../shared/shared/model/student';
import { StudentSearchAutocomplete } from '../shared/search-autocomplete/student-search-autocomplete';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { SearchFilter } from '../shared/model/search-filter';

class MockStudentSearchAutocomplete extends StudentSearchAutocomplete {
  constructor() {
    super(null, 'testKey', 'testLabel');
  }

  autocomplete(stringQuery: string): Observable<Student[]> {
    const testStudent = new Student();
    testStudent.displayName = 'Test User';
    testStudent.firstName = 'Test';
    testStudent.lastName = 'User';
    testStudent.studentNumber = '1234';
    return Observable.of([testStudent]);
  }
}

describe('SearchBoxComponent', () => {
  let component: SearchBoxComponent;
  let fixture: ComponentFixture<SearchBoxComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [FormsModule, MaterialConfigModule, NoopAnimationsModule],
        declarations: [SearchBoxComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBoxComponent);
    component = fixture.componentInstance;
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    component.searchModel$ = Observable.of(searchModel);
    component.pageConfig = new SearchPageConfig();
    component.searchAutocomplete = new MockStudentSearchAutocomplete();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized searchModel ', () => {
    expect(component.searchModel.stringQuery).toBe('iSearch');
  });
  it('should autocomplete', () => {
    component.updateSearch();
    fixture.detectChanges();

    expect(component.filteredOptions.length).toBe(1);
    const testStudent = new Student();
    testStudent.displayName = 'Test User';
    testStudent.firstName = 'Test';
    testStudent.lastName = 'User';
    testStudent.studentNumber = '1234';
    expect(component.filteredOptions).toEqual([testStudent]);
  });
  it('should add filter', () => {
    const event: MatAutocompleteSelectedEvent = <MatAutocompleteSelectedEvent>{
      option: {
        value: 'test'
      }
    };
    component.onSelectFilter(event);

    expect(component.searchModel.stringQuery).toEqual('');
    const expectedFilter = new SearchFilter('testKey', 'test', 'testLabel');
    expect(component.searchModel.filters).toContain(expectedFilter);
  });
});
