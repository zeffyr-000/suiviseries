import { TestBed } from '@angular/core/testing';
import { vi, expect } from 'vitest';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';

describe('NotificationService', () => {
    let service: NotificationService;
    let snackBar: MatSnackBar;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [getTranslocoTestingModule()],
            providers: [NotificationService, MatSnackBar]
        });
        service = TestBed.inject(NotificationService);
        snackBar = TestBed.inject(MatSnackBar);
        vi.spyOn(snackBar, 'open');
        vi.spyOn(snackBar, 'dismiss');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('show', () => {
        it('should open snackbar with translated message', () => {
            service.show('notifications.errors.load_series', 'info');

            expect(snackBar.open).toHaveBeenCalledWith(
                'Erreur lors du chargement des séries',
                undefined,
                {
                    duration: 5000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    panelClass: ['snackbar-info']
                }
            );
        });

        it('should use custom duration', () => {
            service.show('notifications.errors.search', 'info', 1000);

            expect(snackBar.open).toHaveBeenCalled();
            const call = (snackBar.open as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
            expect(call[2]?.duration).toBe(1000);
        });

        it('should apply correct panelClass for type', () => {
            service.show('notifications.errors.search', 'error', 5000);

            expect(snackBar.open).toHaveBeenCalled();
            const call = (snackBar.open as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
            expect(call[2]?.panelClass).toEqual(['snackbar-error']);
        });
    });

    describe('error', () => {
        it('should open snackbar with error type', () => {
            service.error('notifications.errors.add_serie');

            expect(snackBar.open).toHaveBeenCalledWith(
                "Erreur lors de l'ajout de la série",
                undefined,
                {
                    duration: 5000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    panelClass: ['snackbar-error']
                }
            );
        });
    });

    describe('success', () => {
        it('should open snackbar with success type', () => {
            service.success('notifications.success.serie_added');

            expect(snackBar.open).toHaveBeenCalledWith(
                'Série ajoutée à votre liste',
                undefined,
                {
                    duration: 3000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    panelClass: ['snackbar-success']
                }
            );
        });
    });

    describe('warning', () => {
        it('should open snackbar with warning type', () => {
            service.warning('notifications.errors.mark_serie');

            expect(snackBar.open).toHaveBeenCalled();
            const call = (snackBar.open as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
            expect(call[2]?.duration).toBe(4000);
            expect(call[2]?.panelClass).toEqual(['snackbar-warning']);
        });
    });

    describe('info', () => {
        it('should open snackbar with info type', () => {
            service.info('notifications.close');

            expect(snackBar.open).toHaveBeenCalledWith(
                'Fermer la notification',
                undefined,
                {
                    duration: 5000,
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    panelClass: ['snackbar-info']
                }
            );
        });
    });

    describe('dismiss', () => {
        it('should call snackBar.dismiss', () => {
            service.dismiss();

            expect(snackBar.dismiss).toHaveBeenCalled();
        });
    });

    describe('clear', () => {
        it('should call snackBar.dismiss', () => {
            service.clear();

            expect(snackBar.dismiss).toHaveBeenCalled();
        });
    });
});
