import { PersonService } from './person.service';
import { UserService } from '../../user/shared/user.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../user/shared/user';
import { environment } from '../../../environments/environment';
import { Person } from '../shared/model/person';
import { PersonSearchResults } from '../shared/model/person-search-results';
import { of } from 'rxjs';

class UserServiceMock extends UserService {
  constructor() {
    super(null, null, null);
  }

  getUser(): User {
    return new User('test');
  }
}

let httpSpy;
let http: HttpClient;
let personService: PersonService;

const emptySearchResponse = {
  content: [],
  totalPages: 1,
  totalElements: 0,
  last: true,
  size: 100,
  number: 0,
  sort: null,
  numberOfElements: 0,
  first: true
};

const singleSearchResponse = {
  content: [
    {
      DisplayName: 'TEST USER',
      RegisteredFirstMiddleName: 'TEST',
      RegisteredSurname: 'USER',
      PreferredFirstName: null,
      PreferredSurname: null,
      UWRegID: 'ABCD',
      PersonAffiliations: {
        EmployeePersonAffiliation: {
          EmployeeID: '1234'
        }
      },
      priorRegIds: []
    }
  ],
  totalPages: 1,
  totalElements: 1,
  last: true,
  size: 100,
  number: 0,
  sort: null,
  numberOfElements: 1,
  first: true
};

const readResponse = {
  DisplayName: 'TEST USER',
  RegisteredFirstMiddleName: 'TEST',
  RegisteredSurname: 'USER',
  PreferredFirstName: null,
  PreferredSurname: null,
  UWRegID: 'ABCD',
  PersonAffiliations: {
    EmployeePersonAffiliation: {
      EmployeeID: '1234'
    }
  },
  priorRegIds: []
};

const expectedSearchUrl = environment.data_api.url + environment.data_api.personContext;
describe('PersonService', () => {
  beforeEach(() => {
    http = new HttpClient(null);
    personService = new PersonService(http, new UserServiceMock());
  });

  it('should be created', () => {
    expect(personService).toBeTruthy();
  });

  it('should be read a valid regId', () => {
    const expectedUrl = environment.data_api.url + environment.data_api.personContext + '/ABCD';

    httpSpy = spyOn(http, 'get').and.callFake(function(any, any2) {
      return of(readResponse);
    });

    personService.read('ABCD').subscribe((result: Person) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedUrl);
      expect(result.regId).toBe('ABCD');
    });
  });

  it('should autocomplete a valid regId', () => {
    httpSpy = spyOn(http, 'get').and.callFake(function(any, any2) {
      return of(singleSearchResponse);
    });

    personService.autocomplete('1234').subscribe((result: PersonSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('employeeId=1234');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].employeeId).toBe('1234');
    });
  });

  it('should autocomplete a valid lastName, firstName', () => {
    httpSpy = spyOn(http, 'get').and.callFake(function(any, any2) {
      return of(singleSearchResponse);
    });

    personService.autocomplete('user, test').subscribe((result: PersonSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('firstName=test&lastName=user');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].regId).toBe('ABCD');
    });
  });
  it('should autocomplete a valid firstName lastName', () => {
    httpSpy = spyOn(http, 'get').and.callFake(function(any, any2) {
      return of(singleSearchResponse);
    });

    personService.autocomplete('test user').subscribe((result: PersonSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('firstName=test&lastName=user');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].regId).toBe('ABCD');
    });
  });
  it('should autocomplete a valid lastName', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(of(singleSearchResponse));

    personService.autocomplete('user').subscribe((result: PersonSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('lastName=user');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].regId).toBe('ABCD');
    });
  });
  it('should autocomplete a valid firstName after failing as an invalid lastName', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(of(emptySearchResponse), of(singleSearchResponse));

    personService.autocomplete('test').subscribe((result: PersonSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(2);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('lastName=test');
      expect(httpSpy.calls.mostRecent().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.mostRecent().args[1].params.toString()).toEqual('firstName=test');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].regId).toBe('ABCD');
    });
  });
  it('should not attempt to autocomplete for firstName if lastName, first', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(of(emptySearchResponse), of(singleSearchResponse));

    personService.autocomplete('user, test').subscribe((result: PersonSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('firstName=test&lastName=user');
      expect(result.totalElements).toBe(0);
      expect(result.content).toEqual([]);
    });
  });
  it('should not attempt to autocomplete for firstName if firstName lastName', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(of(emptySearchResponse), of(singleSearchResponse));

    personService.autocomplete('test user').subscribe((result: PersonSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('firstName=test&lastName=user');
      expect(result.totalElements).toBe(0);
      expect(result.content).toEqual([]);
    });
  });

  it('should not attempt to autocomplete for firstName if employeeId', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(of(emptySearchResponse), of(singleSearchResponse));

    personService.autocomplete('1111').subscribe((result: PersonSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('employeeId=1111');
      expect(result.totalElements).toBe(0);
      expect(result.content).toEqual([]);
    });
  });
});
