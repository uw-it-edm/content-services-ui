export class PaginatorConfig {
  constructor(
    public pageSize: number = 50,
    public pageSizeOptions: number[] = [10, 25, 50, 100],
    public pageIndex: number = 0,
    public numberOfResults: number = 0
  ) {}
}
