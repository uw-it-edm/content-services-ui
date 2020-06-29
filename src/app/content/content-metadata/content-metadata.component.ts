import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ContentItem } from '../shared/model/content-item';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { FormControl, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';

import { Field } from '../../core/shared/model/field';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { PageConfig } from '../../core/shared/model/page-config';

/**
 * Custom valitor that triggers if no field has values.
 */
const nonEmptyFormValidator: ValidatorFn = (theForm: FormGroup): ValidationErrors | null => {
  const metadata = theForm && theForm.value && theForm.value.metadata;
  if (metadata && Object.keys(metadata).every(key => !metadata[key])) {
    return { incorrect: true };
  }

  return null;
};

@Component({
  selector: 'app-content-metadata',
  templateUrl: './content-metadata.component.html',
  styleUrls: ['./content-metadata.component.css']
})
export class ContentMetadataComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  private componentDestroyed = new Subject();

  @Input() pageConfig: ContentPageConfig;
  @Input() formGroup: FormGroup;
  @Input() contentItem: ContentItem;
  @Input() enableEmptyFormValidator = false;
  @Input() enableCascadingFieldsValidator = false;

  constructor() {}

  ngOnInit() {
    this.formGroup.setControl('metadata', this.generateDisplayedMetadataGroup());

    this.formGroup.setValidators(this.getFormValidators());
    this.formGroup.updateValueAndValidity();

    this.ngOnChanges();
  }

  ngAfterViewInit(): void {
    this.formGroup.markAsPristine(); // Form shouldn't be dirtied by initialization updates
  }

  private generateDisplayedMetadataGroup(): FormGroup {
    const group: any = {};
    this.pageConfig.fieldsToDisplay.map((field: Field) => {
      const formState = { value: '', disabled: field.disabled };
      const formControl = new FormControl(formState);
      this.addValidation(field, formControl);
      group[field.key] = formControl;
    });
    return new FormGroup(group);
  }

  private addValidation(field: Field, formControl: FormControl) {
    // this is where we should handle different type of validation
    if (field.required) {
      formControl.setValidators(Validators.required);
    }
  }

  ngOnChanges() {
    if (this.formGroup && this.contentItem) {
      this.formGroup.reset();
      this.formGroup.patchValue({ label: this.contentItem.label });
      const metaDataForm: FormGroup = <FormGroup>this.formGroup.controls['metadata'];
      if (!isNullOrUndefined(metaDataForm)) {
        this.pageConfig.fieldsToDisplay.map(field => {
          metaDataForm.get(field.key).patchValue(this.contentItem.metadata[field.key]);
        });
      }

      this.formGroup.markAsPristine(); // form shouldn't be dirty after initial loading of metadata
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  getErrorMessage(formControlName: string) {
    // this should probably be improved to handle different error type
    // return this.formGroup.controls['metadata'].controls[formControlName].hasError('required') ? 'You must enter a value' : '';
    return 'You must enter a value';
  }

  isFieldControlRequired(field: Field): boolean {
    const metadata = this.formGroup && this.formGroup.get('metadata');
    const fieldMetadata = metadata && metadata.get(field.key);
    const hasControlError = fieldMetadata && fieldMetadata.errors && fieldMetadata.errors.required;

    const formErrors = this.formGroup && this.formGroup.errors && this.formGroup.errors[field.key];
    const hasFormError = formErrors && formErrors.required;

    return hasControlError || hasFormError;
  }

  /**
   * Resets all the form's controls and clears all validation erros.
   */
  reset(): void {
    const metadataFormGroup = this.formGroup.get('metadata') as FormGroup;

    this.formGroup.reset();

    if (metadataFormGroup) {
      Object.keys(metadataFormGroup.controls).forEach(key => {
       metadataFormGroup.controls[key].setErrors(null);
      });
    }
  }

  private getFormValidators(): ValidatorFn[] {
    let validators: ValidatorFn[] = [];

    if (this.enableEmptyFormValidator) {
      validators.push(nonEmptyFormValidator);
    }

    if (this.enableCascadingFieldsValidator) {
      validators = validators.concat(this.buildCascadingFieldValidators(this.pageConfig));
    }

    return validators;
  }

  private buildCascadingFieldValidators(config: PageConfig): ValidatorFn[] {
    return (config.fieldsToDisplay || [])
      .filter(field => field.dynamicSelectConfig && field.dynamicSelectConfig.parentFieldConfig)
      .map(field => this.buildCascadingFieldValidator(field.dynamicSelectConfig.parentFieldConfig.key, field.key));
  }

  private buildCascadingFieldValidator(parentControlKey: string, childControlKey: string): ValidatorFn {
    return (form: FormGroup): ValidationErrors | null => {
      const metadata = form.get('metadata');
      const parent = metadata && metadata.get(parentControlKey);
      const child = metadata && metadata.get(childControlKey);

      if (parent && child && parent.value && !child.value) {
        return { [childControlKey]: { required: true } };
      }

      return null;
    };
  }
}
