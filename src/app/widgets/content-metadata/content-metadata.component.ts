import { Component, Input, OnInit } from '@angular/core';
import { ContentItem } from '../../model/content-item';
import { EditPageConfig } from '../../model/config/edit-page-config';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-content-metadata',
  templateUrl: './content-metadata.component.html',
  styleUrls: ['./content-metadata.component.css']
})
export class ContentMetadataComponent implements OnInit {
  @Input() pageConfig: EditPageConfig;
  @Input() contentItem: ContentItem;

  testForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  private createForm() {
    this.testForm = this.fb.group({
      label: [this.contentItem.label, Validators.required],
      metadata: this.generateMetadataGroup()
    });
  }

  private generateMetadataGroup(): FormGroup {
    const group: any = {};
    this.pageConfig.fieldsToDisplay.map(field => {
      console.log(field + ': ' + (this.contentItem.metadata[field] || ''));
      group[field] = new FormControl(this.contentItem.metadata[field] || '');
    });
    return new FormGroup(group);
  }

  ngOnInit() {
    this.createForm();
  }
}
