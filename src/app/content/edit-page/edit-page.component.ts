import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { EditPageConfig } from '../../core/shared/model/edit-page-config';
import { ActivatedRoute } from '@angular/router';

import { ContentService } from '../shared/content.service';
import { Config } from '../../core/shared/model/config';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { ContentItem } from '../shared/model/content-item';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit, OnDestroy, OnChanges {
  config: Config;
  pageConfig: EditPageConfig;
  page: string;
  id: string;

  contentItem: ContentItem;
  contentItemUrl: string;
  displayUrl$: Subject<string> = new Subject(); // TODO: urlTo be displayed
  private componentDestroyed = new Subject();

  editContentItemForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private contentService: ContentService,
    private fb: FormBuilder
  ) {}

  file: File; // TODO: should i use this?
  // TODO: confirm that we're looking at the local file
  fileChange(event) {
    const fileList: FileList = event.target.files;
    this.clearPreview();

    if (fileList.length > 0) {
      this.editContentItemForm.get('uploadFile').markAsDirty();
      this.handleInputChange(event);
    } else {
      this.editContentItemForm.get('uploadFile').markAsPristine();
    }
  }

  // TODO: can this stuff be abstracted out?
  // TODO: what if not pdf?
  handleInputChange(e) {
    this.file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    const reader = new FileReader();

    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(this.file);
  }

  _handleReaderLoaded(e) {
    const reader = e.target;
    this.displayUrl$.next(reader.result);
  }

  private clearPreview() {
    this.displayUrl$.next(this.contentItemUrl);
  }

  ngOnInit() {
    console.log('init edit page component');

    // form
    this.createForm();

    // content-item
    this.route.paramMap.takeUntil(this.componentDestroyed).subscribe(params => {
      this.page = params.get('page');
      this.id = params.get('id');

      this.route.data.subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()].editPageConfig;
        this.titleService.setTitle(this.pageConfig.pageName);

        this.contentService
          .read(this.id)
          .takeUntil(this.componentDestroyed)
          .subscribe(
            contentItem => {
              this.contentItem = contentItem;
              this.contentItemUrl = this.contentService.getFileUrl(this.id, true);
              this.displayUrl$.next(this.contentItemUrl); // TODO: initialize? should this be here?
            },
            err => console.error('There was an error reading the content-item:', err) // TODO: Handle error
          );
      });
    });
  }

  private createForm() {
    this.editContentItemForm = this.fb.group({ uploadFile: new FormControl('') });
    // initialize empty form
  }

  onSave(savedItem: ContentItem, file?: File) {
    this.contentService
      .update(savedItem, file)
      .takeUntil(this.componentDestroyed)
      .subscribe(updatedContentItem => (this.contentItem = updatedContentItem));
  }

  onSubmit() {
    this.contentItem = this.prepareSaveContentItem();
    this.onSave(this.contentItem, this.file);
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

  ngOnDestroy(): void {
    // prevent memory leak when component destroyed
    console.log('unsubscribe edit page');
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  ngOnChanges() {
    if (this.editContentItemForm && this.contentItem) {
      this.editContentItemForm.reset();
    }
  }
}
