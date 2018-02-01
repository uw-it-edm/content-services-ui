import { SortDirection } from '@angular/material';

export class SearchUtility {
  public static castSortDirection(direction: string): SortDirection {
    if (direction === 'asc') {
      return 'asc';
    } else if (direction === 'desc') {
      return 'desc';
    }
    return '';
  }
}
