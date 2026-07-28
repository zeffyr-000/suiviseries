import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import { ActivatedRoute } from '@angular/router';

import { AppFooterComponent } from './app-footer.component';
import { getTranslocoTestingModule } from '../../testing/transloco-testing.module';

describe('AppFooterComponent', () => {
    let component: AppFooterComponent;
    let fixture: ComponentFixture<AppFooterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppFooterComponent, getTranslocoTestingModule()],
            providers: [{ provide: ActivatedRoute, useValue: { snapshot: { params: {} } } }],
        });

        fixture = TestBed.createComponent(AppFooterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render a footer landmark', () => {
        expect(fixture.nativeElement.querySelector('footer')).toBeTruthy();
    });

    it('should surface the legal page, which previously only lived in the side menu', () => {
        const links = Array.from(
            fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
        );

        expect(links.some((link) => link.getAttribute('href') === '/legal')).toBe(true);
    });

    it('should stay a navigation block, without a boilerplate legal strip', () => {
        // The attribution and disclaimer live on the legal page, which this
        // footer links to; repeating them on every screen was the part the
        // client read as generic.
        expect(fixture.nativeElement.textContent).not.toContain('The Movie Database');
        expect(fixture.nativeElement.querySelector('.footer-legal')).toBeNull();
    });

    it('should open the repository safely in a new tab', () => {
        const repoLink = fixture.nativeElement.querySelector('a[target="_blank"]');

        expect(repoLink.getAttribute('href')).toBe('https://github.com/zeffyr-000/suiviseries');
        expect(repoLink.getAttribute('rel')).toContain('noopener');
    });

    it('should label both navigation landmarks so they are distinguishable', () => {
        const navs = fixture.nativeElement.querySelectorAll('nav');

        expect(navs).toHaveLength(2);
        expect(navs[0].getAttribute('aria-label')).toBe('Navigation');
        expect(navs[1].getAttribute('aria-label')).toBe('Le projet');
    });

    it('should carry no copyright line', () => {
        expect(fixture.nativeElement.querySelector('.footer-copyright')).toBeNull();
    });
});
