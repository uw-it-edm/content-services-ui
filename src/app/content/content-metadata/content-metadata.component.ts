import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ContentItem } from '../shared/model/content-item';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

import { Field } from '../../core/shared/model/field';
import { isNullOrUndefined } from '../../core/util/node-utilities';

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

  constructor() {}

  ngOnInit() {
    this.createForm();
    this.ngOnChanges();
  }

  ngAfterViewInit(): void {
    this.formGroup.markAsPristine(); // Form shouldn't be dirtied by initialization updates
  }

  private createForm() {
    this.formGroup.setControl('metadata', this.generateDisplayedMetadataGroup());
  }

  private filterOptions(name: string, options: any[]) {
    return options.filter(option => option.toLowerCase().indexOf(name.toLowerCase()) >= 0);
  }

  private initFormState(field: Field) {
    return { value: '', disabled: field.disabled };
  }

  private generateDisplayedMetadataGroup(): FormGroup {
    const group: any = {};
    this.pageConfig.fieldsToDisplay.map((field: Field) => {
      const formState = this.initFormState(field);
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
    this.updateMetadataGroupValues();
  }

  private updateMetadataGroupValues() {
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
}
