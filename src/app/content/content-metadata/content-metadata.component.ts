import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ContentItem } from '../shared/model/content-item';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-content-metadata',
  templateUrl: './content-metadata.component.html',
  styleUrls: ['./content-metadata.component.css']
})
export class ContentMetadataComponent implements OnInit, OnChanges, OnDestroy {
  private componentDestroyed = new Subject();

  @Input() pageConfig: ContentPageConfig;
  @Input() contentItem$: Observable<ContentItem>;
  @Input() formGroup: FormGroup;

  contentItem: ContentItem;

  constructor() {}

  ngOnInit() {
    if (!isNullOrUndefined(this.contentItem$)) {
      this.contentItem$.takeUntil(this.componentDestroyed).subscribe(item => {
        this.contentItem = item;
        this.ngOnChanges();
      });
    }
    this.createForm();
    this.ngOnChanges();
  }

  private createForm() {
    this.formGroup.setControl('metadata', this.generateDisplayedMetadataGroup());
    this.formGroup.setControl('label', new FormControl('', Validators.required));
    this.formGroup.get('label').disable();
  }

  private generateDisplayedMetadataGroup(): FormGroup {
    const group: any = {};
    this.pageConfig.fieldsToDisplay.map(field => (group[field.name] = new FormControl('')));
    return new FormGroup(group);
  }

  ngOnChanges() {
    this.updateMetadataGroupValues();
  }

  private updateMetadataGroupValues() {
    if (this.formGroup && this.contentItem) {
      this.formGroup.patchValue({ label: this.contentItem.label });
      const metaDataForm: FormGroup = <FormGroup>this.formGroup.controls['metadata'];
      if (!isNullOrUndefined(metaDataForm)) {
        this.pageConfig.fieldsToDisplay.map(field => {
          metaDataForm.get(field.name).patchValue(this.contentItem.metadata[field.name]);
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
