import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { DataService } from '../../shared/providers/data.service';
import { isNullOrUndefined } from 'util';
import { ContentItem } from '../shared/model/content-item';

@Component({
  selector: 'app-content-pager',
  templateUrl: './content-pager.component.html',
  styleUrls: ['./content-pager.component.css']
})
export class ContentPagerComponent implements OnInit, OnChanges, OnDestroy {
  private componentDestroyed = new Subject();
  @Input() nextBaseUrl: string;
  @Input() contentItem: ContentItem;
  adjacentIds: string[];

  currentPosition: number;

  constructor(private router: Router, private data: DataService) {}

  ngOnInit() {
    this.adjacentIds = this.data.storage;

    // if (!isNullOrUndefined(this.adjacentIds) && !isNullOrUndefined(this.contentItem$)) {
    //   this.contentItem$.takeUntil(this.componentDestroyed).subscribe(item => {
    //     this.currentPosition = this.adjacentIds.indexOf(item.id);
    //   });
    // }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.contentItem) {
      const item = changes.contentItem.currentValue;
      if (item && this.adjacentIds) {
        this.currentPosition = this.adjacentIds.indexOf(item.id);
      }
    }
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  navigate(adjacentIdIndex: number) {
    const nextUrl = this.nextBaseUrl + this.adjacentIds[adjacentIdIndex];
    this.router.navigate([nextUrl], { queryParamsHandling: 'merge' });
  }
}
