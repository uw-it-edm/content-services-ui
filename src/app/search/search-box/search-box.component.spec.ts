import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SearchBoxComponent } from './search-box.component';
import { FormsModule } from '@angular/forms';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { Observable, of } from 'rxjs';
import { SearchModel } from '../shared/model/search-model';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { Student } from '../../shared/shared/model/student';
import { StudentSearchAutocomplete } from '../shared/search-autocomplete/student-search-autocomplete';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { SearchFilter } from '../shared/model/search-filter';
import { SearchPagination } from '../shared/model/search-pagination';

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
    return of([testStudent]);
  }
}

describe('SearchBoxComponent', () => {
  let component: SearchBoxComponent;
  let fixture: ComponentFixture<SearchBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, MaterialConfigModule, NoopAnimationsModule],
      declarations: [SearchBoxComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBoxComponent);
    component = fixture.componentInstance;
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';
    component.searchModel$ = of(searchModel);
    component.pageConfig = new SearchPageConfig();
    component.searchAutocomplete = new MockStudentSearchAutocomplete();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have an initialized searchModel ', fakeAsync(() => {
    component.ngOnInit();
    tick(1);
    expect(component.searchModel.stringQuery).toBe('iSearch');
  }));

  it('should autocomplete', fakeAsync(() => {
    component.ngOnInit();
    tick(1);
    component.searchBoxUpdated();
    fixture.detectChanges();
    tick(4000);

    expect(component.filteredOptions.length).toBe(1);
    const testStudent = new Student();
    testStudent.displayName = 'Test User';
    testStudent.firstName = 'Test';
    testStudent.lastName = 'User';
    testStudent.studentNumber = '1234';
    expect(component.filteredOptions).toEqual([testStudent]);
  }));

  it('should add filter', () => {
    const event: MatAutocompleteSelectedEvent = <MatAutocompleteSelectedEvent>{
      option: {
        value: {
          value: 'test'
        }
      }
    };
    component.onSelectFilter(event);

    expect(component.searchModel.stringQuery).toEqual('');
    const expectedFilter = new SearchFilter('testKey', 'test', 'testLabel');
    expect(component.searchModel.filters).toContain(expectedFilter);
  });

  it('should reset pagination while keeping pageSize', () => {
    const searchPagination = new SearchPagination();
    searchPagination.pageSize = 123;
    searchPagination.pageIndex = 2;
    component.searchModel.pagination = searchPagination;
    component.executeSearch();

    expect(component.searchModel.pagination.pageSize).toEqual(123);
    expect(component.searchModel.pagination.pageIndex).toEqual(0);
  });
});
