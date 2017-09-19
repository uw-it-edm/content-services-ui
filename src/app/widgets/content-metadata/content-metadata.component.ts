import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ContentItem } from '../../model/content-item';
import { EditPageConfig } from '../../model/config/edit-page-config';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-content-metadata',
  templateUrl: './content-metadata.component.html',
  styleUrls: ['./content-metadata.component.css']
})
export class ContentMetadataComponent implements OnInit, OnChanges {
  @Input() pageConfig: EditPageConfig;
  @Input() contentItem: ContentItem;

  @Output() save = new EventEmitter<ContentItem>();

  editContentItemForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createForm();
    this.ngOnChanges();
  }

  private createForm() {
    this.editContentItemForm = this.fb.group({
      label: ['', Validators.required],
      metadata: this.generateDisplayedMetadataGroup()
    });
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

  onSubmit() {
    this.contentItem = this.prepareSaveContentItem();
    this.save.emit(this.contentItem);
  }

  private prepareSaveContentItem(): ContentItem {
    const formModel = this.editContentItemForm.value;
    const updatedContentItem = new ContentItem(this.contentItem);

    // copy formModel updates into contentItem
    for (const key of Object.keys(formModel.metadata)) {
      updatedContentItem.metadata[key] = formModel.metadata[key];
    }
    return updatedContentItem;
  }

  ngOnChanges() {
    if (this.editContentItemForm) {
      this.editContentItemForm.reset({
        label: this.contentItem.label
      });
      this.editContentItemForm.setControl('metadata', this.generateDisplayedMetadataGroup(this.contentItem.metadata));
    }
  }
}
