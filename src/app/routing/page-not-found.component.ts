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
    <article class="uw-default">
        <div class="cs-main">
          <div *ngIf="tenants">
            <h3>To access this service, please click a link below:</h3>
            <ul>
              <li *ngFor="let availableTenant of tenants">
                <a routerLink="/{{availableTenant['tenantName']}}/">
                  {{availableTenant['tenantName']}}
                </a>
              </li>
            </ul>
          </div>
          <div *ngIf="! tenants">
              <h3>
                  You are not authorized to use this service or the service is not available.
                  Please contact {{supportEmail}}
                  if you believe you should be able to access this information.
              </h3>
          </div>
        </div>
    </article>
  `
})
export class PageNotFoundComponent implements OnInit {
  user$: Observable<User>;
  supportEmail: string;
  tenants: TenantConfigInfo[];
  constructor(private configService: ConfigService, private userService: UserService) {}

  ngOnInit() {
    this.supportEmail = this.configService.getSupportEmail();
    this.user$ = this.userService.getUserObservable();

    this.user$.subscribe(user => {
      if (user) {
        this.configService.getTenantList().subscribe(tenants => {
          this.tenants = tenants;
        });
      }
    });
  }
}
