import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ContentItem } from '../shared/model/content-item';
import { EditPageConfig } from '../../core/shared/model/edit-page-config';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-content-metadata',
  templateUrl: './content-metadata.component.html',
  styleUrls: ['./content-metadata.component.css']
})
export class ContentMetadataComponent implements OnInit, OnChanges {
  @Input() pageConfig: EditPageConfig;
  @Input() contentItem: ContentItem;
  @Input() formGroup: FormGroup;

  constructor() {}

  ngOnInit() {
    this.createForm();
    this.ngOnChanges();
  }

  private createForm() {
    this.formGroup.setControl('metadata', this.generateDisplayedMetadataGroup());
    this.formGroup.setControl('label', new FormControl('', Validators.required));
    this.formGroup.get('label').disable();
  }

  private generateDisplayedMetadataGroup(metadata?: Map<string, any>): FormGroup {
    const group: any = {};
    this.pageConfig.fieldsToDisplay.map(field => {
      if (!isNullOrUndefined(metadata)) {
        group[field] = new FormControl(metadata[field]);
      } else {
        group[field] = new FormControl('');
      }
    });
    return new FormGroup(group);
  }

  ngOnChanges() {
    if (this.formGroup && this.contentItem) {
      this.formGroup.setControl('label', new FormControl(this.contentItem.label, Validators.required));
      this.formGroup.setControl('metadata', this.generateDisplayedMetadataGroup(this.contentItem.metadata));
    }
  }
}
