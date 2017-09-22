import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
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
  @Input() editContentItemForm: FormGroup;

  constructor() {}

  ngOnInit() {
    this.createForm();
    this.ngOnChanges();
  }

  private createForm() {
    this.editContentItemForm.setControl('metadata', this.generateDisplayedMetadataGroup());
    this.editContentItemForm.setControl('label', new FormControl('', Validators.required));
    this.editContentItemForm.get('label').disable();
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
    if (this.editContentItemForm && this.contentItem) {
      this.editContentItemForm.setControl('label', new FormControl(this.contentItem.label, Validators.required));
      this.editContentItemForm.setControl('metadata', this.generateDisplayedMetadataGroup(this.contentItem.metadata));
    }
  }
}
