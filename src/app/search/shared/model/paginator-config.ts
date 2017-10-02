export class PaginatorConfig {
  constructor(
    public pageSize: number = 10,
    public pageSizeOptions: number[] = [5, 10, 25, 100],
    public pageIndex: number = 0,
    public numberOfResults: number = 0
  ) {}
}
