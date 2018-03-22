import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RoutingModule } from './routing/routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    RoutingModule,
    CoreModule,
    Angulartics2Module.forRoot([Angulartics2GoogleTagManager], {})
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
