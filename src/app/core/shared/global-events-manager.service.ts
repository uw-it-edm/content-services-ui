import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GlobalEventsManagerService {
  private _tenant: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public tenantEmitter: Observable<string> = this._tenant.asObservable();

  constructor() {}

  setTenant(tenant: string) {
    this._tenant.next(tenant);
  }
}
