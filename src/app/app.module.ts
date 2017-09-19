import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RoutingModule } from './routing/routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [],
  imports: [BrowserModule, BrowserAnimationsModule, RoutingModule],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
