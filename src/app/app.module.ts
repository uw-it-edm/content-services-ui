import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RoutingModule } from './routing/routing.module';
import { APP_BASE_HREF } from '@angular/common';
import { environment } from '../environments/environment';


@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    RoutingModule,
  ],
  exports: [],
  providers: [{provide: APP_BASE_HREF, useValue: environment.baseHref}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
