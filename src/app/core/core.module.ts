import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { throwIfAlreadyLoaded } from './util/module-import-guard';
import { GlobalEventsManagerService } from './shared/global-events-manager.service';
import { ConfigService } from './shared/config.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule, // we use ngFor
    HttpClientModule
  ],
  exports: [CommonModule],
  declarations: [],
  providers: [ConfigService, GlobalEventsManagerService]
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
