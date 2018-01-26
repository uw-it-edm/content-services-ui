import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalEventsManagerService } from '../../../core/shared/global-events-manager.service';
import { ConfigService } from '../../../core/shared/config.service';
import { UserService } from '../../../user/shared/user.service';
import { User } from '../../../user/shared/user';
import { Observable } from 'rxjs/Observable';
import { ConfigResolver } from '../../../routing/shared/config-resolver.service';
import { MatMenu } from '@angular/material';
import { TenantConfigInfo } from '../../../core/shared/model/tenant-config-info';
import { NotificationService } from '../../providers/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  tenant: string;
  title: string;
  user$: Observable<User>;
  availableTenants$: Observable<TenantConfigInfo[]>;

  @ViewChild(MatMenu) accountMenu: MatMenu;
  @ViewChild(MatMenu) userMenu: MatMenu;

  constructor(
    private configResolver: ConfigResolver,
    private eventsManager: GlobalEventsManagerService,
    private configService: ConfigService,
    private userService: UserService
  ) {}

  ngOnInit() {
    console.log('init header');

    this.user$ = this.userService.getUserObservable();

    this.user$.subscribe(
      user => {
        if (user) {
          this.availableTenants$ = this.configService.getTenantList();
        }
      },
      errorResponse => {
        // FIXME: Handle error responses
      }
    );

    this.eventsManager.tenantEmitter.subscribe(tenant => {
      this.tenant = tenant;
    });
    this.configResolver.getAppNameSubject().subscribe(appName => {
      this.title = appName;
    });
  }
}
