import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RoutingModule } from './routing/routing.module';
import { EditPageComponent } from './pages/edit-page/edit-page.component';
import { ContentService } from './services/content.service';
import { ContentMetadataComponent } from './widgets/content-metadata/content-metadata.component';
import { ContentViewComponent } from './widgets/content-view/content-view.component';

@NgModule({
  declarations: [EditPageComponent, ContentMetadataComponent, ContentViewComponent],
  imports: [BrowserModule, RoutingModule],
  exports: [],
  providers: [ContentService], // TODO: should this be removed, and we handle things with events rather than injecting this?
  bootstrap: [AppComponent]
})
export class AppModule {}
