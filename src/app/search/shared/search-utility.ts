import { SortDirection } from '@angular/material/sort';

const SORT_DIRECTION_ASCENDING = 'ascending';
const SORT_DIRECTION_DESCENDING = 'descending';

export class SearchUtility {
  public static sortDirectionToEnglish(direction: SortDirection): string {
    if (direction === 'asc') {
      return SORT_DIRECTION_ASCENDING;
    } else if (direction === 'desc') {
      return SORT_DIRECTION_DESCENDING;
    }
    return '';
  }

  public static castSortDirection(direction: string): SortDirection {
    if (direction === 'asc') {
      return 'asc';
    } else if (direction === 'desc') {
      return 'desc';
    }
    return '';
  }
}
