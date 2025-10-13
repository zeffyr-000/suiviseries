import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, provideAppInitializer, isDevMode, Injectable, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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

@Injectable({ providedIn: 'root' })
export class TranslocoInlineLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> {
    switch (lang) {
      case 'fr':
        return of(frTranslations);
      default:
        return of(frTranslations);
    }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
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
    })
  ]
};
