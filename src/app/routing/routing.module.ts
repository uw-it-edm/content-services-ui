import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';


import { TenantComponent } from '../pages/tenant/tenant.component';
import { GenericPageComponent } from '../pages/generic-page/generic-page.component';
import { PageNotFoundComponent } from '../pages/page-not-found-component';
import { ConfigResolver } from './config-resolver.service';
import { ConfigService } from '../services/config.service';
import { UserService } from '../user/user.service';
import { AuthGardService } from './auth-gard.service';
import { LoginComponent } from '../pages/login/login.component';
import { MaterialConfigModule } from './material-config.module';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

let ENABLE_ROUTER_TRACING = true;
if (environment.production) {
  ENABLE_ROUTER_TRACING = false;
}

const appRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {
    path: ':tenant', component: TenantComponent,
    canActivate: [AuthGardService],
    canActivateChild: [AuthGardService],
    resolve: {
      config: ConfigResolver
    },
    children: [
      {
        path: ':page', component: GenericPageComponent,
        resolve: {
          config: ConfigResolver
        },
      },
    ]
  },
  {
    path: '**', pathMatch: 'full', component: PageNotFoundComponent
  }
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: ENABLE_ROUTER_TRACING} // <-- debugging purposes only
    ),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialConfigModule
  ],
  declarations: [
    LoginComponent,
    PageNotFoundComponent,
    TenantComponent,
    GenericPageComponent,
  ],
  exports: [
    RouterModule
  ],
  providers: [
    ConfigResolver,
    ConfigService,
    AuthGardService,
    UserService,
  ]
})
export class RoutingModule {
}
