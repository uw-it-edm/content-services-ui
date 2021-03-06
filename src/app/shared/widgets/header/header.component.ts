import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalEventsManagerService } from '../../../core/shared/global-events-manager.service';
import { ConfigService } from '../../../core/shared/config.service';
import { UserService } from '../../../user/shared/user.service';
import { User } from '../../../user/shared/user';
import { Observable } from 'rxjs';
import { ConfigResolver } from '../../../routing/shared/config-resolver.service';
import { MatMenu } from '@angular/material/menu';
import { TenantConfigInfo } from '../../../core/shared/model/tenant-config-info';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  tenant: string;
  title: string;
  user$: Observable<User>;
  availableTenants$: Observable<TenantConfigInfo[]>;

  @ViewChild(MatMenu, { static: true }) accountMenu: MatMenu;
  @ViewChild(MatMenu, { static: true }) userMenu: MatMenu;

  constructor(
    private configResolver: ConfigResolver,
    private eventsManager: GlobalEventsManagerService,
    private configService: ConfigService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user$ = this.userService.getUserObservable();

    this.user$.subscribe((user) => {
      if (user) {
        this.availableTenants$ = this.configService.getTenantList();
      }
    });

    this.eventsManager.tenantEmitter.subscribe((tenant) => {
      this.tenant = tenant;
    });
    this.configResolver.getAppNameSubject().subscribe((appName) => {
      this.title = appName;
    });
  }
}
