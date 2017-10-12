export class User {
  userName: string;
  actAs: string;
  accounts: Map<string, string>;

  constructor(actAs: string) {
    this.userName = actAs;
    this.actAs = actAs;
  }
}
