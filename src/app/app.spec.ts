import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';
import { getTranslocoTestingModule } from './testing/transloco-testing.module';

describe('App', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App, getTranslocoTestingModule()],
            providers: [
                provideRouter([]),
                provideHttpClient()
            ]
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should have menuOpen signal initialized to false', () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        expect(app['menuOpen']()).toBe(false);
    });

    it('should toggle menu', () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;

        app.toggleMenu();
        expect(app['menuOpen']()).toBe(true);

        app.toggleMenu();
        expect(app['menuOpen']()).toBe(false);
    });
});
