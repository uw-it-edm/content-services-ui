export class User {
  userName: string;
  actAs: string;
  userGroups: string[];
  accounts: Map<string, string> = new Map();
  // e.g.: {"CON-FIN-00010-Procurement-FTM-Confidential": "rwd"}

  constructor(actAs: string) {
    this.userName = actAs;
    this.actAs = actAs;
  }
}
