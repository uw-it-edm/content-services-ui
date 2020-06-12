import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, ValidatorFn, ValidationErrors} from '@angular/forms';
import {Router, Navigation, ActivatedRoute} from '@angular/router';
import {Subject, BehaviorSubject, Observable} from 'rxjs';
import {takeUntil, finalize} from 'rxjs/operators';
import {ResultRow} from '../../search/shared/model/result-row';
import {SearchPageConfig} from '../../core/shared/model/search-page-config';
import {Field} from '../../core/shared/model/field';
import {Config} from '../../core/shared/model/config';
import {SearchResults} from '../../search/shared/model/search-result';
import {ContentPageConfig} from '../../core/shared/model/content-page-config';
import {ContentItem} from '../shared/model/content-item';
import { ContentService, BulkUpdateItem, BulkUpdateResponse } from '../shared/content.service';
import {MatSnackBar} from '@angular/material/snack-bar';

export const nonEmptyFormValidator: ValidatorFn = (theForm: FormGroup): ValidationErrors | null => {
  const metadata = theForm && theForm.value && theForm.value.metadata;
  if (metadata && Object.keys(metadata).every(key => !metadata[key])) {
    return { incorrect: true };
  }

  return null;
}

@Component({
  selector: 'app-bulk-edit-page',
  templateUrl: './bulk-edit-page.component.html',
  styleUrls: ['./bulk-edit-page.component.css'],
})
export class BulkEditPageComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  private _rows: ResultRow[] = [];

  config: Config;
  editPageConfig: ContentPageConfig;
  searchPageConfig: SearchPageConfig;
  enableLocalStorage = true;
  staticResults$: BehaviorSubject<SearchResults>;
  form: FormGroup;
  contentItem: ContentItem;
  isUpdatePending = false;

  constructor(
    private _contentService: ContentService,
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) {
    const navigation: Navigation = _router.getCurrentNavigation();
    this._rows = navigation && navigation.extras && navigation.extras.state && navigation.extras.state.selectedRows;
  }

  ngOnInit(): void {
    this.ensureRows();

    this.form = this._formBuilder.group({});

    const staticResults = new SearchResults();
    staticResults.results = this._rows;
    this.staticResults$ = new BehaviorSubject(staticResults);

    this._activatedRoute.data.pipe(takeUntil(this.componentDestroyed)).subscribe((data: { config: Config }) => {
      this.config = data.config;
      this.searchPageConfig = BulkEditPageComponent.getSearchPageConfig(this.config);
      this.editPageConfig = BulkEditPageComponent.getContentPageConfig(this.config);

      this.form.setValidators(BulkEditPageComponent.buildValidators(this.config));
      this.form.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  update() {
    console.log('this.form.value :>> ', this.form.value);
    const updatedRows = this.getUpdatedRows();
    console.log('updatedRows :>> ', updatedRows);

    this.isUpdatePending = true;
    this._contentService.bulkUpdate(updatedRows).pipe(
      finalize(() => this.isUpdatePending = false)
    ).subscribe(response => {
      console.log('response :>> ', response);
      this.removeUpdatedRows(response.successes);
      this.showPostUpdateMessage(response);
    });
  }

  resetFields() {
    this.form.reset();
  }

  cancel() {
    this._router.navigate([this.config.tenant]);
  }

  get areRowsAvailable(): boolean {
    return this._rows && this._rows.length > 0;
  }

  private static buildValidators(config: Config): ValidatorFn[] {
    let validators = [nonEmptyFormValidator];
    const contentConfig: ContentPageConfig = config.pages && config.pages['edit'];

    if (config.availableFields) {
      validators = validators.concat(this.buildParentChildValidators(config.availableFields));
    }

    if (contentConfig) {
      validators = validators.concat(this.buildParentChildValidators(contentConfig.fieldsToDisplay))
    }

    return validators;
  }

  private static buildParentChildValidators(fields: Field[]): ValidatorFn[] {
    const validators = [];

    fields.filter(field => !!field.dynamicSelectConfig).forEach(field => {
      if (field.dynamicSelectConfig.parentFieldConfig) {
        validators.push(BulkEditPageComponent.buildParentChildValidator(field.dynamicSelectConfig.parentFieldConfig.key, field.key));
      }
    });

    return validators;
  }

  private static buildParentChildValidator(parentControlKey: string, childControlKey: string): ValidatorFn {
    return (form: FormGroup): ValidationErrors | null => {
      const metadata = form.get('metadata');
      const parent = metadata && metadata.get(parentControlKey);
      const child = metadata && metadata.get(childControlKey);

      console.log(`parent/child ${childControlKey}:>>`, parent && parent.value, child && child.value);
      if (parent && child && parent.value && !child.value) {
        return { [childControlKey]: { required: true } };
      }
      return null;
    }
  }

  private removeUpdatedRows(items: BulkUpdateItem[]) {
    if (items.length === this._rows.length) {
      this._rows = [];
    } else {
      const ids = items.map(item => item.id);
      this._rows = this._rows.filter(row => !ids.includes(row.id));
    }

    const staticResults = new SearchResults();
    staticResults.results = this._rows;
    this.staticResults$.next(staticResults);
  }

  private showPostUpdateMessage(response: BulkUpdateResponse): Observable<void> {
    let message = `Updated ${response.successes.length} documents.`;
    if (response.failures && response.failures.length > 0) {
      message += ` Failed to update ${response.failures.length} documents.`;
    }

    return this._snackBar.open(message, 'Dismiss').afterOpened();
  }

  private getUpdatedRows(): BulkUpdateItem[] {
    const formData = this.form.value && this.form.value.metadata;

    if (formData) {
      const updatedMetadata = Object.keys(formData).reduce((obj, key) => {
        if (!!formData[key]) {
          obj[key] = formData[key];
        }

        return obj;
      }, {});

      return this._rows.slice(0).map(row => {
        const rowMetadata = Object.assign({}, updatedMetadata, {
          ProfileId: row.metadata['ProfileId'],
          RevisionId: row.metadata['RevisionId']
        });

        return { id: row.id, label: row.label, metadata: rowMetadata };
      });
    }
  }

  private ensureRows() {
    if (this.enableLocalStorage) {
      this._rows = BulkEditPageComponent.saveToLocalStorageAndLoadIfEmpty(this._rows);
    }

    if (!this._rows || this._rows.length === 0) {
      // TODO: either tell user that there is nothing to do here and go back, or automatically go back.
      throw new Error('No rows to edit');
    }
    console.log('this._rows :>> ', this._rows);
  }

  // TODO: create the configuration for the bulk-edit page.
  private static getSearchPageConfig(config: Config): SearchPageConfig {
    const searchPageConfig: SearchPageConfig = Object.assign({}, config.pages['tab-search']);
    searchPageConfig.pageName = "Bulk Edit";

    if (searchPageConfig.fieldKeysToDisplay) {
      searchPageConfig.fieldKeysToDisplay = searchPageConfig.fieldKeysToDisplay.slice(0, 3);
    }

    if (searchPageConfig.fieldsToDisplay) {
      searchPageConfig.fieldsToDisplay = searchPageConfig.fieldsToDisplay.slice(0, 3);
    }

    return searchPageConfig;
  }

  // TODO: create the configuration for the bulk-edit page.
  //       For the prototype we are going to patch the edit page config.
  private static getContentPageConfig(config: Config): ContentPageConfig {
    const contentPageConfig: ContentPageConfig = Object.assign({}, config.pages['edit']);
    contentPageConfig.pageName = "Bulk Edit";

    config.availableFields = this.fixFields(config.availableFields);
    contentPageConfig.fieldsToDisplay = this.fixFields(contentPageConfig.fieldsToDisplay);

    return contentPageConfig;
  }

  private static fixFields(fields: Field[]): Field[] {
    if (fields) {
      fields = fields.filter(field => !field.disabled);
      fields = fields.map(field => Object.assign({}, field, { required: false } ));
      fields.filter(field => field.displayType === 'course-input' && field.courseConfig).forEach(field => {
        field.courseConfig = Object.assign({}, field.courseConfig, { defaultQuarter: '', defaultYear: '' });
      });
    }

    return fields;
  }

  private static saveToLocalStorageAndLoadIfEmpty(rows: ResultRow[]): ResultRow[] {
    if (rows && rows.length > 0) {
      localStorage.setItem('bulk-edit-rows', JSON.stringify(rows));
    } else {
      rows = JSON.parse(localStorage.getItem('bulk-edit-rows'));
    }

    return rows;
  }
}
