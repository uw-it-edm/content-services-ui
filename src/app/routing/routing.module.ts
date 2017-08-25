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
import { HeaderComponent } from '../widgets/header/header.component';
import { AppComponent } from '../app.component';
import { GlobalEventsManagerService } from '../services/global-events-manager.service';
import { SearchResultsComponent } from '../widgets/search-results/search-results.component';
import { SearchService } from '../services/search.service';
import { HttpModule } from '@angular/http';
import { SearchBoxComponent } from '../widgets/search-box/search-box.component';

let enableRouterTracing = true;
if (environment.production) {
  enableRouterTracing = false;
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
        path: ':page',
        component: GenericPageComponent,
        resolve: {
          config: ConfigResolver
        }
      }
    ]
  },
  {
    path: '**',
    pathMatch: 'full',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: enableRouterTracing } // <-- debugging purposes only
    ),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialConfigModule,
    HttpModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    TenantComponent,
    GenericPageComponent,
    HeaderComponent,
    SearchResultsComponent,
    SearchBoxComponent
  ],
  exports: [RouterModule],
  providers: [ConfigService, ConfigResolver, AuthGardService, UserService, GlobalEventsManagerService, SearchService]
})
export class RoutingModule {}
