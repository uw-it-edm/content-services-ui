import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserService } from '../../user/shared/user.service';
import { Observable } from 'rxjs';
import { CacheObservableDecorator } from '../decorators/cache-observable.decorator';

import { isNullOrUndefined } from '../../core/util/node-utilities';
import { DataApiValue } from '../shared/model/data-api-value';
import { DataApiValueSearchResults } from '../shared/model/data-api-value-search-results';

@Injectable()
export class DataApiValueService {
  private valueUrl = environment.data_api.url + environment.data_api.valueContext;
  private DATA_API_VALUE_PAGE_SIZE = '300';

  constructor(private http: HttpClient, private userService: UserService) {}

  @CacheObservableDecorator
  public listByType(type: string): Observable<DataApiValueSearchResults> {
    const params = new HttpParams().set('size', this.DATA_API_VALUE_PAGE_SIZE);
    const options = this.buildRequestOptions(params);

    return this.http.get<DataApiValueSearchResults>(this.valueUrl + '/' + type, options);
  }

  @CacheObservableDecorator
  public getByTypeAndValueId(type: string, valueId: string): Observable<DataApiValue> {
    const options = this.buildRequestOptions();

    return this.http.get<DataApiValue>(this.valueUrl + '/' + type + '/' + valueId, options);
  }

  private buildRequestOptions(httpParams?: HttpParams) {
    const requestOptionsArgs = {};
    if (environment.data_api.authenticationHeader) {
      const user = this.userService.getUser();
      requestOptionsArgs['headers'] = new HttpHeaders().append(environment.data_api.authenticationHeader, user.actAs);
    }

    if (!isNullOrUndefined(httpParams)) {
      requestOptionsArgs['params'] = httpParams;
    }

    return requestOptionsArgs;
  }
}
