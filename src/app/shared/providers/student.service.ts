import { Observable, of } from 'rxjs';

import { map, mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserService } from '../../user/shared/user.service';
import { StudentSearchResults } from '../shared/model/student-search-results';
import { StudentSearchModel } from '../shared/model/student-search-model';
import { CacheObservableDecorator } from '../decorators/cache-observable.decorator';
import { Student } from '../shared/model/student';

import { isNullOrUndefined } from '../../core/util/node-utilities';
import { isNumeric } from 'rxjs/internal-compatibility';

@Injectable()
export class StudentService {
  private studentUrl = environment.data_api.url + environment.data_api.studentContext;

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

      return this.searchStudent(searchModel).pipe(
        mergeMap(result => {
          // if the initial search did not have any results and was only the lastName, try again using the term firstName
          if (
            result.totalElements === 0 &&
            isNullOrUndefined(searchModel.firstName) &&
            isNullOrUndefined(searchModel.studentNumber)
          ) {
            searchModel = this.createAutocompleteSearchModel(term, true);
            return this.searchStudent(searchModel);
          } else {
            return of(result);
          }
        })
      );
    } else {
      return of(new StudentSearchResults());
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

  @CacheObservableDecorator
  public read(studentNumber: string): Observable<Student> {
    const options = this.buildRequestOptions();
    return this.http
      .get<Student>(this.studentUrl + '/' + studentNumber, options)
      .pipe(map(dataApiStudent => this.fromDataApiObject(dataApiStudent)));
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

    return this.http.get<StudentSearchResults>(this.studentUrl, options).pipe(
      map((results: StudentSearchResults) => {
        const studentSearchResults = new StudentSearchResults();

        studentSearchResults.first = results.first;
        studentSearchResults.last = results.last;
        studentSearchResults.number = results.number;
        studentSearchResults.numberOfElements = results.numberOfElements;
        studentSearchResults.size = results.size;
        studentSearchResults.sort = results.sort;
        studentSearchResults.totalElements = results.totalElements;
        studentSearchResults.totalPages = results.totalPages;

        studentSearchResults.content = results.content.map((dataApiStudent: Student) => {
          return this.fromDataApiObject(dataApiStudent);
        });

        return studentSearchResults;
      })
    );
  }

  private fromDataApiObject(dataApiStudent: Student) {
    const student = new Student();
    student.studentNumber = dataApiStudent.studentNumber;
    student.birthdate = dataApiStudent.birthdate;
    student.email = dataApiStudent.email;
    student.firstName = dataApiStudent.firstName;
    student.lastName = dataApiStudent.lastName;
    student.netId = dataApiStudent.netId;
    student.studentNumber = dataApiStudent.studentNumber;
    student.studentSystemKey = dataApiStudent.studentSystemKey;
    return student;
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
