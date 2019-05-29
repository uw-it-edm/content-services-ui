export class SearchPagination {
  constructor(public pageIndex: number = 0, public pageSize: number = 50) {}

  reset() {
    this.pageIndex = 0;
  }
}
