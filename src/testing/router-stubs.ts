import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { convertToParamMap, Data, ParamMap, Params } from '@angular/router';

@Injectable()
export class ActivatedRouteStub {
  // ActivatedRoute.paramMap is Observable
  private paramSubject = new BehaviorSubject(convertToParamMap(this.testParamMap));
  paramMap = this.paramSubject.asObservable();

  private dataSubject = new BehaviorSubject(this.testData);
  data = this.dataSubject.asObservable();

  // Test parameters
  private _testParamMap: ParamMap;
  private _testQueryParamMap: Params;
  private _testData: Data;

  get testParamMap() {
    return this._testParamMap;
  }

  set testParamMap(params: {}) {
    this._testParamMap = convertToParamMap(params);
    this.paramSubject.next(this._testParamMap);
  }

  get testQueryParamMap() {
    return this._testQueryParamMap;
  }

  set testQueryParamMap(params: {}) {
    this._testQueryParamMap = params;
  }

  get testData() {
    return this._testData;
  }

  set testData(data: {}) {
    this._testData = data;
    this.dataSubject.next(this._testData);
  }

  // ActivatedRoute.snapshot.paramMap
  get snapshot() {
    return {
      paramMap: this.testParamMap,
      queryParams: this.testQueryParamMap
    };
  }
}
