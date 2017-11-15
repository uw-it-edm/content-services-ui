import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { UserService } from '../../user/shared/user.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { StudentSearchModel } from '../shared/model/student-search-model';
import { StudentSearchResults } from '../shared/model/student-search-results';

@Injectable()
export class StudentService {
  private studentUrl = environment.data_api.url + environment.data_api.context;

  constructor(private http: HttpClient, private userService: UserService) {}

  public search(searchModel$: Observable<StudentSearchModel>): Observable<StudentSearchResults> {
    return searchModel$
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(searchModel => {
        console.log('processing search request');
        if (isNullOrUndefined(searchModel)) {
          return Observable.of(new StudentSearchResults());
        } else {
          return this.searchStudent(searchModel);
        }
      });
  }

  // TODO: Do we want to convert the API Results into something else?
  public searchStudent(searchModel: StudentSearchModel): Observable<StudentSearchResults> {
    let params = new HttpParams(); // TODO: what if student id
    if (searchModel.firstName) {
      params = params.set('firstName', searchModel.firstName);
    }
    if (searchModel.lastName) {
      params = params.set('lastName', searchModel.lastName);
    }

    const options = this.buildRequestOptions(params);

    return this.http.get<StudentSearchResults>(this.studentUrl, options); // TODO: handle failure
  }

  private buildRequestOptions(httpParams?: HttpParams) {
    // TODO: should this be in an interceptor?
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
