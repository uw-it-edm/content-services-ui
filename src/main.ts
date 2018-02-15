import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  // Disable logging in prod
  console.log = function(...args) {
    return false;
  };
}

platformBrowserDynamic().bootstrapModule(AppModule);
