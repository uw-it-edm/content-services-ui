export class User {
  userName: string;
  actAs: string;
  userGroups: string[];

  constructor(actAs: string) {
    this.userName = actAs;
    this.actAs = actAs;
  }
}
