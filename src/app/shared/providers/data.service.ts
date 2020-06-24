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

  public setToLocalStorage(key: string, object: any): void {
    localStorage.setItem(key, JSON.stringify(object));
  }

  public getFromLocalStorageOrDefault(key: string, defaultObject?: any): any {
    const json = localStorage.getItem(key);

    return json !== null ? JSON.parse(json) : defaultObject;
  }
}
