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
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
  contentItem$: Subject<ContentItem> = new ReplaySubject();

  file: File;
  file$: Subject<File> = new BehaviorSubject(null);

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private contentService: ContentService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    // form
    this.createForm();

    // content-item
    this.route.paramMap.takeUntil(this.componentDestroyed).subscribe(params => {
      this.page = params.get('page');
      this.id = params.get('id');

      this.route.data.takeUntil(this.componentDestroyed).subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()].editPageConfig;
        this.titleService.setTitle(this.pageConfig.pageName);

        this.contentService
          .read(this.id)
          .takeUntil(this.componentDestroyed)
          .subscribe(
            contentItem => {
              this.updateContentItem(contentItem);
            },
            err => console.error('There was an error reading the content-item:', err) // TODO: Handle error
          );
      });
    });
  }

  private updateContentItem(contentItem: ContentItem): void {
    this.contentItem = contentItem;
    this.contentItem$.next(this.contentItem);
  }

  private createForm() {
    this.editContentItemForm = this.fb.group({});
  }

  fileSelected(event) {
    this.file = event;
    this.file$.next(event); // share with content-view
  }

  saveItem() {
    this.contentItem = this.prepareSaveContentItem();
    this.contentService
      .update(this.contentItem, this.file)
      .takeUntil(this.componentDestroyed)
      .subscribe(updatedContentItem => this.updateContentItem(updatedContentItem));
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
