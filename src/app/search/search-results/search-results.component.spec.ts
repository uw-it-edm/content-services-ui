import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SearchResultsComponent } from './search-results.component';
import { MaterialConfigModule } from '../../routing/material-config.module';
import { SearchModel } from '../shared/model/search-model';
import { Field } from '../../core/shared/model/field';
import { of, Subject } from 'rxjs';

import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { SearchResults } from '../shared/model/search-result';
import { SharedModule } from '../../shared/shared.module';
import { Sort } from '../shared/model/sort';
import { ResultRow } from '../shared/model/result-row';

const buildSearchResult = (count: number = 1): SearchResults => {
  const result = new SearchResults();
  result.total = count;

  for (let i = 0; i < count; i++) {
    const row = new ResultRow();
    row.id = `Id_${i}`;
    row.metadata['MyFieldKey'] = `Test Value ${i}`;
    result.results.push(row);
  }

  return result;
};

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialConfigModule, NoopAnimationsModule, RouterTestingModule, SharedModule],
      declarations: [SearchResultsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    const searchModel = new SearchModel();
    searchModel.stringQuery = 'iSearch';

    const field = new Field();
    field.key = 'MyFieldKey';
    field.label = 'Friendly Field Name';

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;

    const pageConfig = new SearchPageConfig();
    pageConfig.defaultSort = new Sort('myfield', 'asc');
    pageConfig.fieldKeysToDisplay.push(field.key);
    pageConfig.fieldsToDisplay.push(field);
    component.pageConfig = pageConfig;

    component.searchModel$ = of(searchModel);
    component.searchResults$ = new Subject<SearchResults>();
    component.searchResults$.next(new SearchResults());

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should set sort order if defaultSort is defined in the pageConfig', () => {
    component.searchResults$.next(new SearchResults());
    fixture.detectChanges();
    expect(component.sortTerm).toBe('myfield');
    expect(component.sortDirection).toBe('asc');
    // This verifies that the change is being passed successfully through the databinding and that the
    // event on the matSort object is being digested correctly
    expect(component.sort.active).toBe('myfield');
    expect(component.sort.direction).toBe('asc');
  });

  it('should change sort order when a new sort is defined in the search results', () => {
    const sort = new Sort('newfield', 'desc');
    component.searchResults$.next(new SearchResults(sort));
    fixture.detectChanges();
    // This verifies that the variables are being directly set in the subscription method
    expect(component.sortTerm).toBe('newfield');
    expect(component.sortDirection).toBe('desc');
    // This verifies that the change is being passed successfully through the databinding and that the
    // event on the matSort object is being digested correctly
    expect(component.sort.active).toBe('newfield');
    expect(component.sort.direction).toBe('desc');
  });

  it('should use the field label for the aria attribute of sorting button', () => {
    const headerButtons = fixture.debugElement.queryAll(By.css('.mat-sort-header-button'));
    expect(headerButtons.length).toBe(2);

    const secondHeaderButton: HTMLElement = headerButtons[1].nativeElement;
    expect(secondHeaderButton.getAttribute('aria-label')).toEqual('Change sorting for Friendly Field Name');
  });

  it('should hide the paginators when freezeResults=true', () => {
    let paginators = fixture.debugElement.queryAll(By.css('mat-paginator'));
    expect(paginators.length).toBe(2);

    component.freezeResults = true;
    fixture.detectChanges();

    paginators = fixture.debugElement.queryAll(By.css('mat-paginator'));
    expect(paginators.length).toBe(0);
  });

  it('should disable all sorting headers when freezeResults=true', () => {
    let sortHeaders = fixture.debugElement.queryAll(By.css('.mat-sort-header-button[disabled=true]'));
    expect(sortHeaders.length).toBe(0);

    component.freezeResults = true;
    fixture.detectChanges();

    sortHeaders = fixture.debugElement.queryAll(By.css('.mat-sort-header-button[disabled=true]'));
    expect(sortHeaders.length).toBe(2);
  });

  it('should disable navigation links when freezeResults=true', () => {
    const results = buildSearchResult();

    component.searchResults$.next(results);
    fixture.detectChanges();

    // verify the table has one link (the id of the row)
    let links = fixture.debugElement.queryAll(By.css('a'));
    expect(links.length).toBe(1);

    component.freezeResults = true;
    fixture.detectChanges();

    // verify the table has no links.
    links = fixture.debugElement.queryAll(By.css('a'));
    expect(links.length).toBe(0);
  });

  it('should add the selection column when selectionEnabled=true', () => {
    let headers = fixture.debugElement.queryAll(By.css('mat-header-cell'));
    expect(headers.length).toBe(2);

    component.selectionEnabled = true;
    fixture.detectChanges();

    headers = fixture.debugElement.queryAll(By.css('mat-header-cell'));
    expect(headers.length).toBe(3);
  });

  it('should emit selected rows when user selects them', (done: DoneFn) => {
    const results = buildSearchResult();

    component.searchResults$.next(results);
    component.selectionEnabled = true;
    fixture.detectChanges();

    component.selectRows.subscribe((rows: ResultRow[]) => {
      expect(rows.length).toBe(1);
      expect(rows[0].id).toBe('Id_0');
      done();
    });

    const firstRowCheckbox = fixture.debugElement.query(By.css('mat-cell .mat-checkbox-input'));
    firstRowCheckbox.nativeElement.click();
    fixture.detectChanges();
  });

  it('should set the select all checkbox to indeterminate state when only some rows are selected', () => {
    const results = buildSearchResult(2);

    component.searchResults$.next(results);
    component.selectionEnabled = true;
    fixture.detectChanges();

    const firstRowCheckbox = fixture.debugElement.query(By.css('mat-cell .mat-checkbox-input'));
    firstRowCheckbox.nativeElement.click();
    fixture.detectChanges();

    const headerCheckbox = fixture.debugElement.query(By.css('mat-header-cell mat-checkbox'));
    expect(headerCheckbox.classes['mat-checkbox-indeterminate']).toBeTrue();
  });

  it('should select and de-select all rows when clicking header checkbox', fakeAsync(() => {
    const results = buildSearchResult(2);
    let selectedRows = [];

    component.selectRows.subscribe(rows => selectedRows = rows);

    component.searchResults$.next(results);
    component.selectionEnabled = true;
    fixture.detectChanges();

    const headerCheckbox = fixture.debugElement.query(By.css('mat-header-cell .mat-checkbox-input')).nativeElement;

    // select all
    headerCheckbox.click();
    fixture.detectChanges();
    tick(100);
    expect(selectedRows.length).toBe(2);

    // de-select all
    headerCheckbox.click();
    fixture.detectChanges();
    tick(100);
    expect(selectedRows.length).toBe(0);
  }));
});
