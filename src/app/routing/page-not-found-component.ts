import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/shared/user.service';
import { ConfigService } from '../core/shared/config.service';
import { User } from '../user/shared/user';
import { Observable } from 'rxjs/Observable';
import { TenantConfigInfo } from '../core/shared/model/tenant-config-info';

@Component({
  moduleId: module.id,
  selector: 'app-404',
  template: `
    <article>
      <h1>Inconceivable!</h1>
      <div>I do not think this page is where you think it is.</div>
      <ul *ngIf="availableTenants$ | async">
        <li *ngFor="let availableTenant of availableTenants$ | async">
          <a routerLink="/{{availableTenant['tenantName']}}/">
            {{availableTenant['tenantName']}}
          </a>
        </li>
      </ul>
    </article>
  `
})
export class PageNotFoundComponent implements OnInit {
  user$: Observable<User>;
  availableTenants$: Observable<TenantConfigInfo[]>;

  constructor(private configService: ConfigService, private userService: UserService) {}

  ngOnInit() {
    this.user$ = this.userService.getUserObservable();

    this.user$.subscribe(user => {
      if (user) {
        this.availableTenants$ = this.configService.getTenantList();
      }
    });
  }
}
