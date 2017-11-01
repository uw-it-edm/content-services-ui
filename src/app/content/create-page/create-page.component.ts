import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContentPageConfig } from '../../core/shared/model/content-page-config';
import { Config } from '../../core/shared/model/config';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ContentService } from '../shared/content.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ContentItem } from '../shared/model/content-item';
import { User } from '../../user/shared/user';
import { UserService } from '../../user/shared/user.service';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.css']
})
export class CreatePageComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject();
  private user: User;
  config: Config;
  pageConfig: ContentPageConfig;
  createContentItemForm: FormGroup;
  page: string;

  file: File;
  file$: Subject<File> = new BehaviorSubject(null);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private contentService: ContentService,
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.userService.getUser();
    // form
    this.createForm();

    this.route.paramMap.takeUntil(this.componentDestroyed).subscribe(params => {
      this.page = params.get('page');

      this.route.data.takeUntil(this.componentDestroyed).subscribe((data: { config: Config }) => {
        this.config = data.config;
        this.pageConfig = data.config.pages[this.page.toLowerCase()].createPageConfig;
        this.titleService.setTitle(this.pageConfig.pageName);
      });
    });
  }

  private createForm() {
    this.createContentItemForm = this.fb.group({});
    this.createContentItemForm.addControl('uploadAnother', new FormControl());
  }

  saveItem() {
    const contentItem = this.prepareSaveContentItem();
    this.contentService
      .create(contentItem, this.file)
      .takeUntil(this.componentDestroyed)
      .subscribe(updatedContentItem => {
        if (this.createContentItemForm.get('uploadAnother').value) {
          this.createContentItemForm.reset();
        } else {
          this.router.navigate([this.config.tenant + '/' + this.page]);
        }
      });
  }

  private prepareSaveContentItem(): ContentItem {
    const formModel = this.createContentItemForm.value;
    const updatedContentItem = new ContentItem();

    // copy formModel updates into contentItem
    for (const key of Object.keys(formModel.metadata)) {
      updatedContentItem.metadata[key] = formModel.metadata[key];
    }
    updatedContentItem.metadata['ProfileId'] = this.config.profile;
    updatedContentItem.metadata['Account'] = this.config.account + '/' + this.user.userName; // TODO: This should be done serverside
    return updatedContentItem;
  }

  fileSelected(event) {
    this.file = event;
    this.file$.next(event); // share with content-view
  }

  buttonPress(button) {
    this[button.command]();
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
