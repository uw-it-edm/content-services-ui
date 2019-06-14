import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommonModule } from '@angular/common';

import { TenantComponent } from '../user/tenant/tenant.component';
import { SearchPageComponent } from '../search/search-page/search-page.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { ConfigResolver } from './shared/config-resolver.service';
import { UserService } from '../user/shared/user.service';
import { AuthGardService } from './shared/auth-gard.service';
import { LoginComponent } from '../user/login/login.component';
import { MaterialConfigModule } from './material-config.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { AppComponent } from '../app.component';
import { EditPageComponent } from '../content/edit-page/edit-page.component';
import { SearchModule } from '../search/search.module';
import { ContentModule } from '../content/content.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { CreatePageComponent } from '../content/create-page/create-page.component';
import { HttpClientModule } from '@angular/common/http';
import { DisplaySearchPageComponent } from '../search/display-search-page/display-search-page.component';
import { PendingChangesGuard } from './shared/pending-changes.guard';

let enableRouterTracing = false;
if (environment.enableRouterTracing) {
  enableRouterTracing = true;
}

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: ':tenant',
    component: TenantComponent,
    canActivate: [AuthGardService],
    canActivateChild: [AuthGardService],
    resolve: {
      config: ConfigResolver
    },
    children: [
      {
        path: 'create',
        component: CreatePageComponent,
        canDeactivate: [PendingChangesGuard],
        resolve: {
          config: ConfigResolver
        }
      },
      {
        path: 'edit/:id',
        component: EditPageComponent,
        canDeactivate: [PendingChangesGuard],
        resolve: {
          config: ConfigResolver
        }
      },
      {
        path: ':page',
        component: SearchPageComponent,
        resolve: {
          config: ConfigResolver
        }
      },
      {
        path: ':page/display-search',
        component: DisplaySearchPageComponent,
        resolve: {
          config: ConfigResolver
        }
      },
      {
        path: '**',
        redirectTo: 'tab-search'
      }
    ]
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    canActivate: [AuthGardService]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes, {
      enableTracing: enableRouterTracing, // <-- debugging purposes only
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
      scrollOffset: [0, 64] // [x, y]
    }),
    BrowserModule,
    BrowserAnimationsModule,
    MaterialConfigModule,
    HttpClientModule,
    SearchModule,
    ContentModule,
    SharedModule,
    UserModule
  ],
  declarations: [AppComponent, PageNotFoundComponent],
  exports: [RouterModule],
  providers: [ConfigResolver, AuthGardService, UserService, PendingChangesGuard]
})
export class RoutingModule {}
