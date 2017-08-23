import { Component, OnInit } from '@angular/core';
import { GlobalEventsManagerService } from '../../services/global-events-manager.service';
import { ConfigService } from '../../services/config.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  tenant: string;
  promiseUser: Promise<User>;
  availableTenants: Promise<string[]>;

  constructor(private eventsManager: GlobalEventsManagerService,
              private configService: ConfigService,
              private userService: UserService) {
  }


  ngOnInit() {
    this.promiseUser = this.userService.getAuthenticatedUser();
    this.availableTenants = this.configService.getTenantList();
    this.eventsManager.tenantEmitter.subscribe(tenant => {
      this.tenant = tenant;
    });
  }

}
