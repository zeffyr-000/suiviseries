import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import { frTranslations } from '../i18n/fr';

// Factory function to create a TranslocoTestingModule for unit tests
// Following Transloco best practices: https://jsverse.gitbook.io/transloco/advanced-features/unit-testing
export function getTranslocoTestingModule(options: TranslocoTestingOptions = {}) {
    return TranslocoTestingModule.forRoot({
        langs: { fr: frTranslations },
        translocoConfig: {
            availableLangs: ['fr'],
            defaultLang: 'fr',
        },
        preloadLangs: true,
        ...options,
    });
}
