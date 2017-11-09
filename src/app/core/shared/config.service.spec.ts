import { inject, TestBed } from '@angular/core/testing';

import { ConfigService } from './config.service';
import { UserService } from '../../user/shared/user.service';
import { User } from '../../user/shared/user';
import { HttpClientModule } from '@angular/common/http';

describe('ConfigService', () => {
  class UserServiceMock extends UserService {
    constructor() {
      super(null);
    }

    getUser(): User {
      return new User('test');
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientModule],
      providers: [ConfigService, { provide: UserService, useValue: new UserServiceMock() }]
    });
  });

  it(
    'should be created',
    inject([ConfigService], (service: ConfigService) => {
      expect(service).toBeTruthy();
    })
  );

  it(
    'should return a Promise',
    inject([ConfigService], (service: ConfigService) => {
      expect(service.getConfigForTenant('test')).toBeTruthy();
    })
  );

  it(
    'should have a Demo profile',
    inject([ConfigService], (service: ConfigService) => {
      service.getConfigForTenant('demo').then(demoConfig => {
        expect(demoConfig).toBeTruthy();
        expect(demoConfig.tenant).toBe('Demo');
      });
    })
  );
});
