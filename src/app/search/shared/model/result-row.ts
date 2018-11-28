export class ResultRow {
  public id: string;
  public label: string;
  public metadata: Map<string, any>;

  constructor() {
    this.metadata = new Map<string, any>();
  }
}
