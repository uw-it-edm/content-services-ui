import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UserService } from '../../user/shared/user.service';
import { Observable } from 'rxjs/Observable';
import { CacheObservableDecorator } from '../decorators/cache-observable.decorator';
import 'rxjs/add/operator/mergeMap';
import { isNumeric } from 'rxjs/util/isNumeric';
import { isNullOrUndefined } from '../../core/util/node-utilities';
import { PersonSearchModel } from '../shared/model/person-search-model';
import { PersonSearchResults } from '../shared/model/person-search-results';
import { Person } from '../shared/model/person';
import { DataApiSearchResults } from '../shared/model/data-api-search-results';

@Injectable()
export class PersonService {
  private personUrl = environment.data_api.url + environment.data_api.personContext;

  constructor(private http: HttpClient, private userService: UserService) {}

  /* term is the query term that the user types
      - lastName, firstName
      - first name lastName
      - lastName
      - firstName
      - employeeId */
  public autocomplete(term: string): Observable<PersonSearchResults> {
    if (term && term.trim().length > 0) {
      let searchModel = this.createAutocompleteSearchModel(term);

      return this.searchPerson(searchModel).flatMap(result => {
        // if the initial search did not have any results and was only the lastName, try again using the term firstName
        if (
          result.totalElements === 0 &&
          isNullOrUndefined(searchModel.firstName) &&
          isNullOrUndefined(searchModel.employeeId)
        ) {
          searchModel = this.createAutocompleteSearchModel(term, true);
          return this.searchPerson(searchModel);
        } else {
          return Observable.of(result);
        }
      });
    } else {
      return Observable.of(new PersonSearchResults());
    }
  }

  private createAutocompleteSearchModel(term: string, termIsFirstName = false) {
    const searchModel = new PersonSearchModel();

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
      searchModel.employeeId = term;
    } else if (termIsFirstName) {
      searchModel.firstName = term;
    } else {
      searchModel.lastName = term;
    }

    return searchModel;
  }

  @CacheObservableDecorator
  public read(regId: string): Observable<Person> {
    const options = this.buildRequestOptions();
    return this.http
      .get<any>(this.personUrl + '/' + regId, options)
      .map(pwsPerson => this.newPersonFromPwsPerson(pwsPerson));
  }

  private searchPerson(searchModel: PersonSearchModel): Observable<PersonSearchResults> {
    let params = new HttpParams();
    if (searchModel.firstName) {
      params = params.set('firstName', searchModel.firstName);
    }
    if (searchModel.lastName) {
      params = params.set('lastName', searchModel.lastName);
    }
    if (searchModel.employeeId) {
      params = params.set('employeeId', searchModel.employeeId);
    }

    const options = this.buildRequestOptions(params);

    return this.http.get<DataApiSearchResults>(this.personUrl, options).map((results: DataApiSearchResults) => {
      const personSearchResults = new PersonSearchResults();

      personSearchResults.first = results.first;
      personSearchResults.last = results.last;
      personSearchResults.number = results.number;
      personSearchResults.numberOfElements = results.numberOfElements;
      personSearchResults.size = results.size;
      personSearchResults.sort = results.sort;
      personSearchResults.totalElements = results.totalElements;
      personSearchResults.totalPages = results.totalPages;

      personSearchResults.content = results.content.map((pwsPerson: any) => {
        return this.newPersonFromPwsPerson(pwsPerson);
      });

      return personSearchResults;
    });
  }

  private newPersonFromPwsPerson(pwsPerson: any): Person {
    const person = new Person();
    person.displayName = pwsPerson['DisplayName'];
    person.regId = pwsPerson['UWRegID'];
    person.priorRegIds = pwsPerson['PriorUWRegIDs'];
    person.netId = pwsPerson['UWNetID'];
    person.email = pwsPerson['PersonAffiliations']['EmployeePersonAffiliation']['EmailAddresses'];
    person.employeeId = pwsPerson['PersonAffiliations']['EmployeePersonAffiliation']['EmployeeID'];
    person.registeredFirstName = pwsPerson['RegisteredFirstMiddleName'];
    person.registeredLastName = pwsPerson['RegisteredSurname'];
    person.firstName = pwsPerson['PreferredFirstName'];
    person.lastName = pwsPerson['PreferredSurname'];

    return person;
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
