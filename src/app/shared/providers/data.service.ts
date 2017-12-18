import { Injectable } from '@angular/core';

@Injectable()
export class DataService {
  private storage: any = {};

  constructor() {}

  public get(key: string): any {
    if (this.storage.hasOwnProperty(key)) {
      return this.storage[key];
    } else {
      return null;
    }
  }

  public set(key: string, object: any) {
    this.storage[key] = object;
  }
}
