import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class GlobalEventsManagerService {
  private _tenant: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public tenantEmitter: Observable<string> = this._tenant.asObservable();

  constructor() {}

  setTenant(tenant: string) {
    this._tenant.next(tenant);
  }
}
