import { inject, TestBed, async } from '@angular/core/testing';

import { UserService } from './user.service';
import { User } from './user';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProgressService } from '../../shared/providers/progress.service';
import { NotificationService } from '../../shared/providers/notification.service';
import { MaterialConfigModule } from '../../routing/material-config.module';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MaterialConfigModule],
      providers: [
        NotificationService,
        ProgressService,
        UserService,
        { provide: HttpClient, useValue: new HttpClient(null) }
      ]
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));

  it('should return a user named myusername', async(
    inject([UserService, HttpClient], (service: UserService, http: HttpClient) => {
      const httpSpy = spyOn(http, 'get').and.returnValue(
        of({
          userName: 'myusername',
          userGroups: ['test-group']
        })
      );

      const authenticatedUserObservable: Observable<User> = service.getUserObservable();

      authenticatedUserObservable.subscribe(authenticatedUser => {
        expect(authenticatedUser.actAs).toBe('myusername');
        expect(authenticatedUser.userName).toBe('myusername');
        expect(authenticatedUser.userGroups).toEqual(['test-group']);
      });
    })
  ));
});
