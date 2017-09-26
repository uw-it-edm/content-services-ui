import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { EditPageConfig } from '../../core/shared/model/edit-page-config';
import { ActivatedRoute } from '@angular/router';

import { ContentService } from '../shared/content.service';
import { Config } from '../../core/shared/model/config';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { ContentItem } from '../shared/model/content-item';
import { FormBuilder, FormGroup } from '@angular/forms';
import 'rxjs/add/observable/of';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.css']
})
export class EditPageComponent implements OnInit, OnDestroy, OnChanges {
  private componentDestroyed = new Subject();

  config: Config;
  pageConfig: EditPageConfig;
  page: string;
  id: string;
  editContentItemForm: FormGroup;

  contentItem: ContentItem;
  contentItemUrl: string;

  displayUrl$: Subject<string> = new ReplaySubject(); // TODO: urlTo be displayed
  displayItem$: Subject<ContentItem> = new ReplaySubject();
  file: File;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private contentService: ContentService,
    private fb: FormBuilder
  ) {}

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
              this.displayUrl$.next(this.contentItemUrl);
            },
            err => console.error('There was an error reading the content-item:', err) // TODO: Handle error
          );
      });
    });
  }

  private createForm() {
    this.editContentItemForm = this.fb.group({});
    // initialize empty form
  }

  fileSelected(event) {
    this.displayItem$.next();
    if (isNullOrUndefined(event)) {
      // revert preview back to initial contentItem
      this.displayUrl$.next(this.contentItemUrl);
      this.displayItem$.next(this.contentItem);
    }
    this.file = event;
  }

  saveItem() {
    this.contentItem = this.prepareSaveContentItem();
    this.contentService
      .update(this.contentItem, this.file)
      .takeUntil(this.componentDestroyed)
      .subscribe(updatedContentItem => (this.contentItem = updatedContentItem));
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

  buttonPress(button) {
    this[button.command]();
  }

  deleteItem() {
    alert('Delete');
  }

  publishItem() {
    alert('Publish!');
  }
}
