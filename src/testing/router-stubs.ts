import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { convertToParamMap, Data, ParamMap } from '@angular/router';

@Injectable()
export class ActivatedRouteStub {

  // ActivatedRoute.paramMap is Observable
  private paramSubject = new BehaviorSubject(convertToParamMap(this.testParamMap));
  paramMap = this.paramSubject.asObservable();

  private dataSubject = new BehaviorSubject(this.testData);
  data = this.dataSubject.asObservable();

  // Test parameters
  private _testParamMap: ParamMap;
  private _testData: Data;

  get testParamMap() { return this._testParamMap; }
  set testParamMap(params: {}) {
    this._testParamMap = convertToParamMap(params);
    this.paramSubject.next(this._testParamMap);
  }

  get testData() { return this._testData; }
  set testData(data: {}) {
    this._testData = data;
    this.dataSubject.next(this._testData);
  }

  // ActivatedRoute.snapshot.paramMap
  get snapshot() {
    return { paramMap: this.testParamMap };
  }
}
