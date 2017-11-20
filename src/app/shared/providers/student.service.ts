import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { UserService } from '../../user/shared/user.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { StudentSearchModel } from '../shared/model/student-search-model';
import { StudentSearchResults } from '../shared/model/student-search-results';
import { Student } from '../shared/model/student';
import { isNumeric } from 'rxjs/util/isNumeric';
import { CacheObservableDecorator } from '../decorators/cache-observable.decorator';

@Injectable()
export class StudentService {
  private studentUrl = environment.data_api.url + environment.data_api.context;

  constructor(private http: HttpClient, private userService: UserService) {}

  /* term is the query term that the user types
      - lastName, firstName
      - first name lastName
      - lastName
      - firstName
      - studentNumber */
  public autocomplete(term: string): Observable<StudentSearchResults> {
    if (term && term.trim().length > 0) {
      let searchModel = this.createAutocompleteSearchModel(term);

      return this.searchStudent(searchModel).flatMap(result => {
        // if the initial search did not have any results and was only the lastName, try again using the term firstName
        if (
          result.totalElements === 0 &&
          isNullOrUndefined(searchModel.firstName) &&
          isNullOrUndefined(searchModel.studentNumber)
        ) {
          searchModel = this.createAutocompleteSearchModel(term, true);
          return this.searchStudent(searchModel);
        } else {
          return Observable.of(result);
        }
      });
    } else {
      return Observable.of(new StudentSearchResults());
    }
  }

  private createAutocompleteSearchModel(term: string, termIsFirstName = false) {
    const searchModel = new StudentSearchModel();

    if (term.indexOf(',') !== -1) {
      const names: string[] = term.split(',', 2).map(s => s.trim());
      if (names.length > 0) {
        searchModel.lastName = names[0];
      }
      if (names.length > 1) {
        searchModel.firstName = names[1];
      }
    } else if (term.indexOf(' ') !== -1) {
      const names: string[] = term.split(' ', 2).map(s => s.trim());
      if (names.length > 1) {
        searchModel.lastName = names[1];
      }
      if (names.length > 0) {
        searchModel.firstName = names[0];
      }
    } else if (isNumeric(term)) {
      searchModel.studentNumber = term;
    } else if (termIsFirstName) {
      searchModel.firstName = term;
    } else {
      searchModel.lastName = term;
    }

    return searchModel;
  }

  private searchStudent(searchModel: StudentSearchModel): Observable<StudentSearchResults> {
    let params = new HttpParams();
    if (searchModel.firstName) {
      params = params.set('firstName', searchModel.firstName);
    }
    if (searchModel.lastName) {
      params = params.set('lastName', searchModel.lastName);
    }
    if (searchModel.studentNumber) {
      params = params.set('studentNumber', searchModel.studentNumber);
    }

    const options = this.buildRequestOptions(params);

    return this.http.get<StudentSearchResults>(this.studentUrl, options); // TODO: handle failure
  }

  @CacheObservableDecorator
  public read(studentNumber: string): Observable<Student> {
    const options = this.buildRequestOptions();
    return this.http.get<Student>(this.studentUrl + '/' + studentNumber, options); // TODO: handle failure
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
