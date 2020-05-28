export class User {
  userName: string;
  actAs: string;
  userGroups: string[];
  accounts: Map<string, string> = new Map();

  constructor(actAs: string) {
    this.userName = actAs;
    this.actAs = actAs;
  }
}
