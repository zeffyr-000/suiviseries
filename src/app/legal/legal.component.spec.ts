import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';

import { LegalComponent } from './legal.component';
import { getTranslocoTestingModule } from '../testing/transloco-testing.module';
import { MetadataService } from '../services/metadata.service';

describe('LegalComponent', () => {
    let component: LegalComponent;
    let fixture: ComponentFixture<LegalComponent>;
    let metadataService: { updatePageMetadata: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        metadataService = {
            updatePageMetadata: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [LegalComponent, getTranslocoTestingModule()],
            providers: [
                { provide: MetadataService, useValue: metadataService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LegalComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have correct author name and GitHub URLs', () => {
        expect(component.authorName).toBe('Christophe Saint-Julien');
        expect(component.authorGithub).toBe('https://github.com/zeffyr-000/');
        expect(component.projectRepo).toBe('https://github.com/zeffyr-000/suiviseries');
    });

    it('should update metadata on init', () => {
        expect(metadataService.updatePageMetadata).toHaveBeenCalledWith(
            expect.objectContaining({
                canonicalUrl: expect.stringContaining('/legal'),
                includeOpenGraph: true,
                includeTwitter: true
            })
        );
    });

    it('should render the legal page title', () => {
        fixture.detectChanges();

        const titleElement = fixture.nativeElement.querySelector('h1');
        expect(titleElement).toBeTruthy();
    });

    it('should render author name', () => {
        fixture.detectChanges();

        const authorName = fixture.nativeElement.querySelector('.author-name');
        expect(authorName.textContent).toContain('Christophe Saint-Julien');
    });

    it('should have external links with proper attributes', () => {
        fixture.detectChanges();

        const links = fixture.nativeElement.querySelectorAll('a[target="_blank"]');
        expect(links.length).toBe(2);

        links.forEach((link: HTMLAnchorElement) => {
            expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        });
    });
});
