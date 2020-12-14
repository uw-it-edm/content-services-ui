import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { Title, By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';

import { BulkEditPageComponent } from './bulk-edit-page.component';
import { ContentMetadataComponent } from '../content-metadata/content-metadata.component';
import { ContentService, BulkUpdateResponse } from '../shared/content.service';

import { DataService } from '../../shared/providers/data.service';
import { DisplayFieldComponent } from '../../shared/widgets/display-field/display-field.component';
import { Config } from '../../core/shared/model/config';
import { Field } from '../../core/shared/model/field';
import { BulkEditPageConfig } from '../../core/shared/model/bulk-edit-page-config';
import { SearchResultsComponent } from '../../search/search-results/search-results.component';
import { ResultRow } from '../../search/shared/model/result-row';
import { ActivatedRouteStub } from '../../../testing/router-stubs';
import { MaterialConfigModule } from '../../routing/material-config.module';

const testMetadata: any = {
  field1: 'value 1.1',
  field2: 'value 1.2',
  field3: 'value 1.3',
  field4: 'value 1.4',
  ProfileId: 'test-profile',
};
const testRows: ResultRow[] = [
  { id: '111', label: 'label 1', metadata: Object.assign({ RevisionId: 1 }, testMetadata) },
  { id: '222', label: 'label 2', metadata: Object.assign({ RevisionId: 2 }, testMetadata) },
  { id: '333', label: 'label 3', metadata: Object.assign({ RevisionId: 3 }, testMetadata) },
];

function getConfigs(): { config: Config; pageConfig: BulkEditPageConfig } {
  const pageConfig = new BulkEditPageConfig();
  pageConfig.pageName = 'test-bulk-edit-page';
  pageConfig.fieldsToDisplay = [
    Object.assign(new Field(), { key: 'field1', label: 'label 1' }),
    Object.assign(new Field(), { key: 'field2', label: 'label 2' }),
    Object.assign(new Field(), { key: 'field3', label: 'label 3' }),
    Object.assign(new Field(), { key: 'field4', label: 'label 4' }),
  ];
  pageConfig.resultsTableFieldsToDisplay = pageConfig.fieldsToDisplay.slice(0);

  const config = new Config();
  config.tenant = 'test-tenant';
  config.pages['bulk-edit'] = pageConfig;
  return { config, pageConfig };
}

describe('BulkEditPageComponent', () => {
  let component: BulkEditPageComponent;
  let fixture: ComponentFixture<BulkEditPageComponent>;
  let activatedRoute: ActivatedRouteStub;
  let contentServiceSpy: ContentService;
  let dataServiceSpy: DataService;
  let snackBarSpy: MatSnackBar;

  beforeEach(async(() => {
    activatedRoute = new ActivatedRouteStub();
    contentServiceSpy = jasmine.createSpyObj('ContentService', ['bulkUpdate']);
    dataServiceSpy = jasmine.createSpyObj('DataService', ['set', 'setToLocalStorage', 'getFromLocalStorageOrDefault']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [HttpClientModule, MaterialConfigModule, NoopAnimationsModule, RouterTestingModule],
      declarations: [BulkEditPageComponent, ContentMetadataComponent, SearchResultsComponent, DisplayFieldComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: ContentService, useValue: contentServiceSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        FormBuilder,
        Title,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    (<any>dataServiceSpy.getFromLocalStorageOrDefault).and.returnValue(testRows);
    (<any>contentServiceSpy.bulkUpdate).and.returnValue(of({ successes: [], failures: [] }));

    activatedRoute.testData = { config: getConfigs().config };

    fixture = TestBed.createComponent(BulkEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('on initial load', () => {
    it('should save to local storage the rows received through navigation', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'getCurrentNavigation').and.returnValue({ extras: { state: { selectedRows: testRows } } } as any);

      fixture = TestBed.createComponent(BulkEditPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(dataServiceSpy.setToLocalStorage).toHaveBeenCalledWith('bulk-edit-rows', testRows);
    });

    it('should set the title and header to the page name from config', () => {
      const title = fixture.debugElement.injector.get(Title);
      expect(title.getTitle()).toEqual('test-bulk-edit-page');

      const header = fixture.debugElement.query(By.css('h2'));
      expect(header.nativeElement.textContent).toBe('test-bulk-edit-page');
    });

    it('should display the results table with rows from local storage', () => {
      const resultsComponent: SearchResultsComponent = fixture.debugElement.query(By.directive(SearchResultsComponent)).componentInstance;
      expect(resultsComponent.freezeResults).toBeTruthy();
      expect(resultsComponent.selectionEnabled).toBeFalsy();

      const rows = fixture.debugElement.queryAll(By.css('app-search-results mat-row'));
      expect(rows.length).toBe(3);
    });

    it('should display the results table with columns from config', () => {
      const headers = fixture.debugElement.queryAll(By.css('app-search-results mat-header-cell'));
      expect(headers.length).toBe(5);
    });

    it('should display the content metadata fields from config', () => {
      const rows = fixture.debugElement.queryAll(By.css('app-content-metadata mat-form-field'));
      expect(rows.length).toBe(4);
    });

    it('should remove disabled fields and mark all metadata fields as non-required', () => {
      const { config, pageConfig } = getConfigs();
      pageConfig.fieldsToDisplay[0].required = true;
      pageConfig.fieldsToDisplay[1].disabled = true;

      activatedRoute.testData = { config: config };

      fixture = TestBed.createComponent(BulkEditPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.pageConfig.fieldsToDisplay[0].required).toBeFalse();
      expect(component.pageConfig.fieldsToDisplay.length).toBe(3);
    });

    it('should fall back to use the fields to display from tab-search page if none are defined', () => {
      const { config, pageConfig } = getConfigs();
      pageConfig.resultsTableFieldsToDisplay = null;
      pageConfig.resultsTableFieldKeysToDisplay = null;
      config.pages['tab-search'] = { fieldsToDisplay: pageConfig.fieldsToDisplay };

      activatedRoute.testData = { config: config };

      fixture = TestBed.createComponent(BulkEditPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.searchPageConfig.fieldsToDisplay.length).toBe(pageConfig.fieldsToDisplay.length);
    });

    it('should resolve the fields to display in search table from resultsTableFieldKeysToDisplay', () => {
      const { config, pageConfig } = getConfigs();
      pageConfig.resultsTableFieldsToDisplay = [];
      pageConfig.resultsTableFieldKeysToDisplay = ['field1'];
      config.availableFields = pageConfig.fieldsToDisplay;

      activatedRoute.testData = { config: config };

      fixture = TestBed.createComponent(BulkEditPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.searchPageConfig.fieldsToDisplay.length).toBe(1);
    });
  });

  describe('on button operations', () => {
    it('should update the cancel button text depending on whether there are rows left to update', () => {
      let cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
      expect(cancelButton.nativeElement.textContent).toContain('Cancel Bulk Update');

      component.removeRowsById(testRows.map((row) => row.id));
      fixture.detectChanges();

      cancelButton = fixture.debugElement.query(By.css('.cancel-button'));
      expect(cancelButton.nativeElement.textContent).toContain('Close Bulk Update');
    });

    it('should navigate to search page when clicking the cancel button', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.stub();

      fixture = TestBed.createComponent(BulkEditPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.cancel();
      expect(router.navigate).toHaveBeenCalledWith(['test-tenant'], { state: { autoFocusOnNavigate: true } });
    });

    it('should reset all metadata fields when clicking reset fields button', () => {
      component.form.get('metadata').get('field1').setValue('edit value');

      component.resetFields();

      expect(component.form.get('metadata').get('field1').value).toBe(null);
    });

    it('should disable update button if form is empty', () => {
      const getUpdateButtonDisabledState = () => fixture.debugElement.query(By.css('.update-button')).attributes['disabled'];
      expect(getUpdateButtonDisabledState()).toBeTruthy();

      component.form.get('metadata').get('field1').setValue('edit value');
      fixture.detectChanges();
      expect(getUpdateButtonDisabledState()).toBeFalsy();

      component.resetFields();
      fixture.detectChanges();
      expect(getUpdateButtonDisabledState()).toBeTruthy();
    });

    it('should disable update button if no more rows to update are available', () => {
      const getUpdateButtonDisabledState = () => fixture.debugElement.query(By.css('.update-button')).attributes['disabled'];
      expect(getUpdateButtonDisabledState()).toBeTruthy();

      component.form.get('metadata').get('field1').setValue('edit value');
      fixture.detectChanges();
      expect(getUpdateButtonDisabledState()).toBeFalsy();

      component.removeRowsById(testRows.map((row) => row.id));
      fixture.detectChanges();
      expect(getUpdateButtonDisabledState()).toBeTruthy();
    });
  });

  describe('on update', () => {
    it('should call update service with the metadata that was set for all rows and appending the profile and revision id', () => {
      component.form.get('metadata').get('field1').setValue('edit value');
      component.form.get('metadata').get('field2').setValue(['item1']);
      component.form.get('metadata').get('field3').setValue(null);
      component.form.get('metadata').get('field4').setValue([]);
      component.update();

      expect(contentServiceSpy.bulkUpdate).toHaveBeenCalledWith([
        {
          id: '111',
          label: 'label 1',
          metadata: { field1: 'edit value', field2: ['item1'], ProfileId: 'test-profile', RevisionId: 1 },
        },
        {
          id: '222',
          label: 'label 2',
          metadata: { field1: 'edit value', field2: ['item1'], ProfileId: 'test-profile', RevisionId: 2 },
        },
        {
          id: '333',
          label: 'label 3',
          metadata: { field1: 'edit value', field2: ['item1'], ProfileId: 'test-profile', RevisionId: 3 },
        },
      ]);
    });

    it('should set pending state while update is in progress', fakeAsync(() => {
      const updateSubject = new Subject<BulkUpdateResponse>();
      (<any>contentServiceSpy.bulkUpdate).and.returnValue(updateSubject);

      expect(component.isUpdatePending).toBeFalse();

      component.update();
      expect(component.isUpdatePending).toBeTrue();

      updateSubject.next({ successes: [], failures: [] });
      updateSubject.complete();
      flush();

      expect(component.isUpdatePending).toBeFalse();
    }));

    it('should remove rows from table and local storage that were updated successfully', () => {
      const failedRows = testRows.slice(2);
      (<any>contentServiceSpy.bulkUpdate).and.returnValue(of({ successes: testRows.slice(0, 2), failures: failedRows }));

      component.update();
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('app-search-results mat-row'));
      expect(rows.length).toBe(1);
      const firstCell = fixture.debugElement.query(By.css('app-search-results mat-cell'));
      expect(firstCell.nativeElement.textContent).toBe('333');

      expect(dataServiceSpy.setToLocalStorage).toHaveBeenCalledWith('bulk-edit-rows', failedRows);
    });

    it('should display snack bar with success message after update', () => {
      (<any>contentServiceSpy.bulkUpdate).and.returnValue(of({ successes: testRows.slice(), failures: [] }));

      component.update();
      expect(snackBarSpy.open).toHaveBeenCalledWith('Updated 3 documents.', 'Dismiss', { duration: 5000, politeness: 'assertive' });
    });

    it('should display snack bar with error message after update', () => {
      (<any>contentServiceSpy.bulkUpdate).and.returnValue(of({ successes: testRows.slice(0, 2), failures: testRows.slice(2) }));

      component.update();

      expect(snackBarSpy.open).toHaveBeenCalledWith('Updated 2 documents. Failed to update 1 documents.', 'Dismiss', {
        politeness: 'assertive',
      });
    });

    it('should display error if update operation fails', () => {
      (<any>contentServiceSpy.bulkUpdate).and.returnValue(throwError(new Error('test error')));

      component.update();

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Bulk update failed to complete, please check your permissions and try again.',
        'Dismiss'
      );
    });

    it('should display error if update operation timesout', fakeAsync(() => {
      (<any>contentServiceSpy.bulkUpdate).and.returnValue(new Subject<BulkUpdateResponse>());

      component.update();
      tick(95000);
      fixture.detectChanges();

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Bulk update failed to complete, please check your permissions and try again.',
        'Dismiss'
      );
    }));
  });
});
