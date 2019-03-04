import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataService } from '../../shared/providers/data.service';
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
    this.adjacentIds = this.data.get('adjacentIds');
    this.determineCurrentPosition(this.contentItem, this.adjacentIds);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.contentItem) {
      const item = changes.contentItem.currentValue;
      this.determineCurrentPosition(item, this.adjacentIds);
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

  private determineCurrentPosition(item: ContentItem, adjacentIds: string[]) {
    if (item && adjacentIds) {
      this.currentPosition = adjacentIds.indexOf(item.id);
    }
  }
}
