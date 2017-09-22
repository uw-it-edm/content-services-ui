import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RoutingModule } from './routing/routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { SafeUrlPipe } from './util/safe-url.pipe';
import { PdfViewerComponent } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [],
  imports: [SharedModule, BrowserModule, BrowserAnimationsModule, RoutingModule, CoreModule],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
