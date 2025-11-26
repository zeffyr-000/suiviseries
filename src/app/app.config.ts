import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, provideAppInitializer, isDevMode, Injectable, inject } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTransloco, TranslocoLoader, Translation } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { Observable, of } from 'rxjs';

import {
  NGX_GOOGLE_ANALYTICS_INITIALIZER_PROVIDER,
  NGX_GOOGLE_ANALYTICS_SETTINGS_TOKEN
} from 'ngx-google-analytics';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { frTranslations } from './i18n/fr';
import { AnalyticsRouterService } from './services/analytics-router.service';
import { AuthService } from './services/auth.service';
import { UpdateService } from './services/update.service';
import { KeepAliveService } from './services/keep-alive.service';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';

@Injectable({ providedIn: 'root' })
export class TranslocoInlineLoader implements TranslocoLoader {
  getTranslation(): Observable<Translation> {
    return of(frTranslations);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideTransloco({
      config: {
        availableLangs: ['fr'],
        defaultLang: 'fr',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoInlineLoader
    }),
    provideTranslocoMessageformat(),
    {
      provide: NGX_GOOGLE_ANALYTICS_SETTINGS_TOKEN,
      useValue: {
        trackingCode: environment.googleAnalyticsId,
        enableTracing: !environment.production
      }
    },
    NGX_GOOGLE_ANALYTICS_INITIALIZER_PROVIDER,
    provideAppInitializer(() => {
      const analyticsRouter = inject(AnalyticsRouterService);
      analyticsRouter.initialize();
    }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.initializeAuth();
    }),
    provideAppInitializer(() => {
      const updateService = inject(UpdateService);
      updateService.checkForUpdates();
    }),
    provideAppInitializer(() => {
      const keepAliveService = inject(KeepAliveService);
      keepAliveService.startKeepAlive();
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
