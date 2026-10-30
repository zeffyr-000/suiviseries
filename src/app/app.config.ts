import {
    ApplicationConfig,
    EnvironmentProviders,
    Provider,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
    provideAppInitializer,
    isDevMode,
    Injectable,
    inject,
} from '@angular/core';
import {
    provideRouter,
    withInMemoryScrolling,
    withPreloading,
    withViewTransitions,
    PreloadAllModules,
} from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTransloco, TranslocoLoader, Translation } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { Observable, of } from 'rxjs';

import {
    NGX_GOOGLE_ANALYTICS_INITIALIZER_PROVIDER,
    NGX_GOOGLE_ANALYTICS_SETTINGS_TOKEN,
} from 'ngx-google-analytics';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { frTranslations } from './i18n/fr';
import { AnalyticsRouterService } from './services/analytics-router.service';
import { AuthService } from './services/auth.service';
import { UpdateService } from './services/update.service';
import { KeepAliveService } from './services/keep-alive.service';
import { authInterceptor } from './interceptors/auth.interceptor';
import { ContainerViewportScroller } from './services/container-viewport-scroller';
import { provideServiceWorker } from '@angular/service-worker';

@Injectable({ providedIn: 'root' })
export class TranslocoInlineLoader implements TranslocoLoader {
    getTranslation(): Observable<Translation> {
        return of(frTranslations);
    }
}

// Transloco with MessageFormat, kept in one function so the pluralisation and
// number formatting the app relies on can be exercised directly in a test.
export function provideAppTransloco(): (Provider | EnvironmentProviders)[] {
    return [
        provideTransloco({
            config: {
                availableLangs: ['fr'],
                defaultLang: 'fr',
                reRenderOnLangChange: true,
                prodMode: !isDevMode(),
            },
            loader: TranslocoInlineLoader,
        }),
        // The locale must be given here: Transloco only notifies the transpiler
        // on a language *change*, never for the default language, so without
        // it MessageFormat stays on English and prints "1,155 épisodes".
        provideTranslocoMessageformat({ locales: 'fr' }),
    ];
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        // View transitions let a poster morph into the detail hero. Browsers
        // without support navigate normally, so nothing is gated on it.
        provideRouter(
            routes,
            withPreloading(PreloadAllModules),
            withViewTransitions(),
            // Top on a new page, the previous offset on back and forward. The
            // page scrolls inside the sidenav content, hence the scroller below.
            withInMemoryScrolling({
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
            }),
        ),
        { provide: ViewportScroller, useClass: ContainerViewportScroller },
        provideHttpClient(withInterceptors([authInterceptor])),
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        provideAnimations(),
        provideAppTransloco(),
        {
            provide: NGX_GOOGLE_ANALYTICS_SETTINGS_TOKEN,
            useValue: {
                trackingCode: environment.googleAnalyticsId,
                enableTracing: !environment.production,
            },
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
        provideServiceWorker('custom-sw.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000',
        }),
    ],
};
