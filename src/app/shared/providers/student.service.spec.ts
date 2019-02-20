import { StudentService } from './student.service';
import { UserService } from '../../user/shared/user.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../user/shared/user';
import { Observable } from 'rxjs/Observable';
import { Student } from '../shared/model/student';
import { environment } from '../../../environments/environment';
import { StudentSearchResults } from '../shared/model/student-search-results';

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
let studentService: StudentService;

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
      displayName: 'TEST USER',
      firstName: 'TEST',
      lastName: 'USER',
      birthDate: null,
      email: null,
      studentNumber: '1234',
      netId: null,
      studentSystemKey: '4321'
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
  displayName: 'TEST USER',
  firstName: 'TEST',
  lastName: 'USER',
  birthDate: null,
  email: null,
  studentNumber: '1234',
  netId: null,
  studentSystemKey: '4321'
};

const expectedSearchUrl = environment.data_api.url + environment.data_api.studentContext;
describe('StudentService', () => {
  beforeEach(() => {
    http = new HttpClient(null);
    studentService = new StudentService(http, new UserServiceMock());
  });

  it('should be created', () => {
    expect(studentService).toBeTruthy();
  });

  it('should be read a valid studentNumber', () => {
    const expectedUrl = environment.data_api.url + environment.data_api.studentContext + '/1234';

    httpSpy = spyOn(http, 'get').and.callFake(function(any, any2) {
      return Observable.of(readResponse);
    });

    studentService.read('1234').subscribe((result: Student) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedUrl);
      expect(result.studentNumber).toBe('1234');
    });
  });

  it('should autocomplete a valid studentNumber', () => {
    httpSpy = spyOn(http, 'get').and.callFake(function(any, any2) {
      return Observable.of(singleSearchResponse);
    });

    studentService.autocomplete('1234').subscribe((result: StudentSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('studentNumber=1234');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].studentNumber).toBe('1234');
    });
  });

  it('should autocomplete a valid lastName, firstName', () => {
    httpSpy = spyOn(http, 'get').and.callFake(function(any, any2) {
      return Observable.of(singleSearchResponse);
    });

    studentService.autocomplete('user, test').subscribe((result: StudentSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('firstName=test&lastName=user');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].studentNumber).toBe('1234');
    });
  });
  it('should autocomplete a valid firstName lastName', () => {
    httpSpy = spyOn(http, 'get').and.callFake(function(any, any2) {
      return Observable.of(singleSearchResponse);
    });

    studentService.autocomplete('test user').subscribe((result: StudentSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('firstName=test&lastName=user');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].studentNumber).toBe('1234');
    });
  });
  it('should autocomplete a valid lastName', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(Observable.of(singleSearchResponse));

    studentService.autocomplete('user').subscribe((result: StudentSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('lastName=user');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].studentNumber).toBe('1234');
    });
  });
  it('should autocomplete a valid firstName after failing as an invalid lastName', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(
      Observable.of(emptySearchResponse),
      Observable.of(singleSearchResponse)
    );

    studentService.autocomplete('test').subscribe((result: StudentSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(2);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('lastName=test');
      expect(httpSpy.calls.mostRecent().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.mostRecent().args[1].params.toString()).toEqual('firstName=test');
      expect(result.totalElements).toBe(1);
      expect(result.content[0].studentNumber).toBe('1234');
    });
  });
  it('should not attempt to autocomplete for firstName if lastName, first', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(
      Observable.of(emptySearchResponse),
      Observable.of(singleSearchResponse)
    );

    studentService.autocomplete('user, test').subscribe((result: StudentSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('firstName=test&lastName=user');
      expect(result.totalElements).toBe(0);
      expect(result.content).toEqual([]);
    });
  });
  it('should not attempt to autocomplete for firstName if firstName lastName', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(
      Observable.of(emptySearchResponse),
      Observable.of(singleSearchResponse)
    );

    studentService.autocomplete('test user').subscribe((result: StudentSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('firstName=test&lastName=user');
      expect(result.totalElements).toBe(0);
      expect(result.content).toEqual([]);
    });
  });

  it('should not attempt to autocomplete for firstName if studentNumber', () => {
    httpSpy = spyOn(http, 'get').and.returnValues(
      Observable.of(emptySearchResponse),
      Observable.of(singleSearchResponse)
    );

    studentService.autocomplete('1111').subscribe((result: StudentSearchResults) => {
      expect(httpSpy).toHaveBeenCalledTimes(1);
      expect(httpSpy.calls.first().args[0]).toBe(expectedSearchUrl);
      expect(httpSpy.calls.first().args[1].params.toString()).toEqual('studentNumber=1111');
      expect(result.totalElements).toBe(0);
      expect(result.content).toEqual([]);
    });
  });
});
