import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ContentService } from '../../content/shared/content.service';
import { ContentObject } from '../../content/shared/model/content-object';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-document-displayer',
  templateUrl: './document-displayer.component.html',
  styleUrls: ['./document-displayer.component.css']
})
export class DocumentDisplayerComponent implements OnDestroy, AfterViewInit {
  private componentDestroyed = new Subject();

  @Input()
  itemId: string;

  contentObject: ContentObject;
  dataLocalUrl: SafeResourceUrl;

  constructor(private contentService: ContentService, private domSanitizer: DomSanitizer) {}

  ngAfterViewInit() {
    console.log('init DocumentDisplayerComponent with item ' + this.itemId);
    this.createContentObject(this.itemId);
  }

  private createContentObject(itemId: string) {
    this.contentService
      .read(itemId)
      .toPromise()
      .then(item => {
        const fileUrl = this.contentService.getFileUrl(itemId, true);
        const contentObject = new ContentObject(item);
        contentObject.setUrl(fileUrl);

        this.dataLocalUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(contentObject.url);

        this.contentObject = contentObject;
      });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
