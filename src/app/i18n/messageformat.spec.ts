import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { provideAppTransloco } from '../app.config';

// Runs the real Transloco + MessageFormat setup from app.config, which the
// testing module does not include, so French plural rules and number
// formatting are checked end to end.
describe('MessageFormat (fr)', () => {
    let transloco: TranslocoService;

    beforeEach(async () => {
        TestBed.configureTestingModule({ providers: [provideAppTransloco()] });

        transloco = TestBed.inject(TranslocoService);
        await firstValueFrom(transloco.load('fr'));
    });

    it('should group thousands the French way', () => {
        // \s covers the narrow no-break space Intl uses for French grouping.
        expect(transloco.translate('series.episodes', { count: 1155 })).toMatch(
            /^1\s155 épisodes$/,
        );
    });

    it('should apply the explicit zero case', () => {
        expect(transloco.translate('series.seasons', { count: 0 })).toBe('Aucune saison');
    });

    it('should use the singular for one', () => {
        expect(transloco.translate('series.seasons', { count: 1 })).toBe('1 saison');
    });

    it('should use the plural above one', () => {
        expect(transloco.translate('series.seasons', { count: 5 })).toBe('5 saisons');
    });
});
