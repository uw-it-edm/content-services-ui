import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { UserService } from './shared/user.service';
import { LoginComponent } from './login/login.component';
import { TenantComponent } from './tenant/tenant.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [SharedModule, RouterModule],
  exports: [],
  declarations: [LoginComponent, TenantComponent],
  providers: [UserService]
})
export class UserModule {}
