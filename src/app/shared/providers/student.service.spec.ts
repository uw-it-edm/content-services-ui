import { TestBed, inject } from '@angular/core/testing';

import { StudentService } from './student.service';
import { UserService } from '../../user/shared/user.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../user/shared/user';

class UserServiceMock extends UserService {
  constructor() {
    super(null);
  }

  getUser(): User {
    return new User('test');
  }
}

describe('StudentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentService,
        { provide: UserService, useValue: new UserServiceMock() },
        { provide: HttpClient, useValue: new HttpClient(null) }
      ]
    });
  });

  it(
    'should be created',
    inject([StudentService], (service: StudentService) => {
      expect(service).toBeTruthy();
    })
  );
});
