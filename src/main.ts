
import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http';

// Bootstraps your standalone app using Angular Zones
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptorsFromDi(), withFetch()) // add withFetch
  ]
}).catch(err => console.error(err));

if (environment.production) {
  enableProdMode();
}
