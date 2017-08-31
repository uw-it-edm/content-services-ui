import { Injectable } from '@angular/core';
import { User } from './user';

@Injectable()
export class UserService {
  private loggedUser;

  constructor() {}

  getAuthenticatedUser(): Promise<User> {
    const user: User = new User('Maxime Deravet', 'maximed');

    // TODO save in local storage ?

    this.loggedUser = user;
    return Promise.resolve(user);
  }

  getUser(): User {
    const user: User = new User('Maxime Deravet', 'maximed');

    // TODO save in local storage ?

    return this.loggedUser;
  }
}
