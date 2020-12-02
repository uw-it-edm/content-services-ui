import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, Navigation, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, finalize, timeout } from 'rxjs/operators';
import { Config } from '../../core/shared/model/config';
import { BulkEditPageConfig } from '../../core/shared/model/bulk-edit-page-config';
import { SearchPageConfig } from '../../core/shared/model/search-page-config';
import { ResultRow } from '../../search/shared/model/result-row';
import { SearchResults } from '../../search/shared/model/search-result';
import { ContentItem, IContentItem } from '../shared/model/content-item';
import { ContentService } from '../shared/content.service';
import { DataService } from '../../shared/providers/data.service';
import { ContentMetadataComponent } from '../content-metadata/content-metadata.component';
import { DefaultAutoFocusNavigationState } from '../../shared/shared/auto-focus-navigation-state';

const ROWS_LOCAL_STORAGE_KEY = 'bulk-edit-rows';
const UPDATE_OPERATION_TIMEOUT = 90 * 1000;

@Component({
  selector: 'app-bulk-edit-page',
  templateUrl: './bulk-edit-page.component.html',
  styleUrls: ['./bulk-edit-page.component.css'],
})
export class BulkEditPageComponent implements OnInit, OnDestroy {
  private _componentDestroyed = new Subject();
  private _rows: ResultRow[] = [];

  isUpdatePending = false;
  config: Config;
  pageConfig: BulkEditPageConfig;
  searchPageConfig: SearchPageConfig;
  staticResults$: BehaviorSubject<SearchResults>;
  form: FormGroup;
  contentItem: ContentItem;

  @ViewChild(ContentMetadataComponent) contentMetadataComponent: ContentMetadataComponent;

  /**
   * Getter so that template can bind to the default navigation state.
   */
  get autoFocusNavigationState() {
    return DefaultAutoFocusNavigationState;
  }

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _titleService: Title,
    private _contentService: ContentService,
    private _dataService: DataService,
    private _snackBar: MatSnackBar
  ) {
    const navigation: Navigation = _router.getCurrentNavigation();
    this._rows = navigation && navigation.extras && navigation.extras.state && navigation.extras.state.selectedRows;
  }

  ngOnInit(): void {
    this.form = this._formBuilder.group({});

    if (this._rows) {
      this._dataService.setToLocalStorage(ROWS_LOCAL_STORAGE_KEY, this._rows);
    } else {
      this._rows = this._dataService.getFromLocalStorageOrDefault(ROWS_LOCAL_STORAGE_KEY, []);
    }

    const staticResults = new SearchResults();
    staticResults.results = this._rows;
    this.staticResults$ = new BehaviorSubject(staticResults);

    this._activatedRoute.data.pipe(takeUntil(this._componentDestroyed)).subscribe((data: { config: Config }) => {
      this.config = data.config;

      const configs = BulkEditPageComponent.extractPageConfigs(this.config);
      this.pageConfig = configs.editConfig;
      this.searchPageConfig = configs.searchConfig;

      this._titleService.setTitle(this.pageConfig.pageName);
    });
  }

  ngOnDestroy(): void {
    this._componentDestroyed.next();
    this._componentDestroyed.complete();
  }

  resetFields() {
    this.contentMetadataComponent.reset();
  }

  cancel() {
    this._router.navigate([this.config.tenant], { state: DefaultAutoFocusNavigationState });
  }

  get areRowsAvailable(): boolean {
    return this.rowCount > 0;
  }

  get rowCount(): number {
    return this._rows && this._rows.length;
  }

  update() {
    const updatedRows = this.getUpdatedRows();
    console.log('Submitting documents for update', updatedRows);

    this.isUpdatePending = true;

    this._contentService
      .bulkUpdate(updatedRows)
      .pipe(
        timeout(UPDATE_OPERATION_TIMEOUT),
        finalize(() => (this.isUpdatePending = false))
      )
      .subscribe(
        (response) => {
          const successes = (response && response.successes) || [];
          const failures = (response && response.failures) || [];
          this.removeRowsById(successes.map((row) => row.id));
          this.showPostUpdateMessage(successes, failures);
        },
        (err) => this._snackBar.open(`Bulk update operation failed to complete, please try again. Error: ${err.message || err}`, 'Dismiss')
      );
  }

  public removeRowsById(ids: string[]) {
    ids = ids || [];
    this._rows = this._rows.filter((row) => !ids.includes(row.id));

    const staticResults = new SearchResults();
    staticResults.results = this._rows;
    this.staticResults$.next(staticResults);

    this._dataService.setToLocalStorage(ROWS_LOCAL_STORAGE_KEY, this._rows);
  }

  private getUpdatedRows(): IContentItem[] {
    const formData = this.form.value && this.form.value.metadata;
    const updatedMetadata: { [key: string]: any } = {};
    const isValidValue = (val) => (Array.isArray(val) ? val.length > 0 : !!val);

    if (!formData) {
      return [];
    }

    Object.keys(formData)
      .filter((key) => isValidValue(formData[key]))
      .forEach((key) => (updatedMetadata[key] = formData[key]));

    return this._rows.map((row) => {
      return {
        id: row.id,
        label: row.label,
        metadata: Object.assign({}, updatedMetadata, {
          ProfileId: row.metadata['ProfileId'],
          RevisionId: row.metadata['RevisionId'],
        }),
      };
    });
  }

  private showPostUpdateMessage(successes: IContentItem[], failures: IContentItem[]): void {
    const snackBarConfig: MatSnackBarConfig = {};
    snackBarConfig.politeness = 'assertive';
    let message = `Updated ${successes.length} documents.`;

    if (failures.length > 0) {
      message += ` Failed to update ${failures.length} documents.`;
    } else {
      snackBarConfig.duration = 5000;
    }

    this._snackBar.open(message, 'Dismiss', snackBarConfig);
  }

  // tslint:disable-next-line:member-ordering
  private static extractPageConfigs(config: Config): { editConfig: BulkEditPageConfig; searchConfig: SearchPageConfig } {
    // Remove any field marked as read-only (they are not bulk-editable) and remove required validators
    const editConfig: BulkEditPageConfig = Object.assign({}, config.pages['bulk-edit']);
    editConfig.fieldsToDisplay = editConfig.fieldsToDisplay.filter((field) => !field.disabled);
    editConfig.fieldsToDisplay = editConfig.fieldsToDisplay.map((field) => Object.assign({}, field, { required: false }));

    const searchConfig: SearchPageConfig = Object.assign({}, config.pages['tab-search'], { defaultSort: null });
    const searchFieldKeys = editConfig.resultsTableFieldKeysToDisplay;

    if (searchFieldKeys && searchFieldKeys.length > 0) {
      searchConfig.fieldsToDisplay = config.availableFields.filter((field) => searchFieldKeys.includes(field.key));
    } else if (editConfig.resultsTableFieldsToDisplay) {
      searchConfig.fieldsToDisplay = editConfig.resultsTableFieldsToDisplay;
    }

    return { editConfig, searchConfig };
  }
}
