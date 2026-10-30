import { ModuleWithProviders } from '@angular/core';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { frTranslations } from '../i18n/fr';

// Factory function to create a TranslocoTestingModule for unit tests
// Following Transloco best practices: https://jsverse.gitbook.io/transloco/advanced-features/unit-testing
//
// The MessageFormat transpiler is added so templates render what users see:
// single-brace params ({name}) and plurals are only resolved by MessageFormat,
// and the default transpiler would leave them as raw text.
export function getTranslocoTestingModule(
    options: TranslocoTestingOptions = {},
): ModuleWithProviders<TranslocoTestingModule> {
    const testingModule = TranslocoTestingModule.forRoot({
        langs: { fr: frTranslations },
        translocoConfig: {
            availableLangs: ['fr'],
            defaultLang: 'fr',
        },
        preloadLangs: true,
        ...options,
    });

    return {
        ...testingModule,
        providers: [
            ...(testingModule.providers ?? []),
            provideTranslocoMessageformat({ locales: 'fr' }),
        ],
    };
}
