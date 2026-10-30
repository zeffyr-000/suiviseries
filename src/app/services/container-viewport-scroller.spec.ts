import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContainerViewportScroller } from './container-viewport-scroller';

describe('ContainerViewportScroller', () => {
    let scroller: ContainerViewportScroller;
    let container: HTMLElement;
    let scrollTo: ReturnType<typeof vi.fn>;

    // jsdom does no layout: the geometry an assertion relies on is set by hand
    const place = (element: HTMLElement, props: Record<string, unknown>) => {
        for (const [key, value] of Object.entries(props)) {
            Object.defineProperty(element, key, { configurable: true, value });
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [ContainerViewportScroller] });
        scroller = TestBed.inject(ContainerViewportScroller);

        container = document.createElement('mat-sidenav-content');
        scrollTo = vi.fn();
        container.scrollTo = scrollTo as unknown as HTMLElement['scrollTo'];
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
        vi.restoreAllMocks();
    });

    it('should read the offset of the sidenav content, where the page actually scrolls', () => {
        place(container, { scrollLeft: 0, scrollTop: 1802 });

        expect(scroller.getScrollPosition()).toEqual([0, 1802]);
    });

    it('should land a new page in place rather than glide up from the last one', () => {
        scroller.scrollToPosition([0, 0]);

        expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'instant' });
    });

    it('should keep a behaviour it is given', () => {
        scroller.scrollToPosition([0, 640], { behavior: 'smooth' });

        expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 640, behavior: 'smooth' });
    });

    it('should bring an anchor up to just below the offset, from its layout position', () => {
        const section = document.createElement('section');
        section.id = 'decouvrir';
        container.appendChild(section);
        place(section, { offsetLeft: 0, offsetTop: 900, offsetParent: container });
        scroller.setOffset([0, 64]);

        scroller.scrollToAnchor('decouvrir');

        expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 836, behavior: undefined });
    });

    it('should accept the offset as a function, read when the anchor is reached', () => {
        const section = document.createElement('section');
        section.id = 'decouvrir';
        container.appendChild(section);
        place(section, { offsetLeft: 0, offsetTop: 900, offsetParent: container });
        let toolbarHeight = 64;
        scroller.setOffset(() => [0, toolbarHeight]);
        toolbarHeight = 56;

        scroller.scrollToAnchor('decouvrir');

        expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 844 }));
    });

    it('should do nothing for an anchor that is not on the page', () => {
        scroller.scrollToAnchor('nowhere');

        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('should fall back to the window when there is no sidenav content', () => {
        container.remove();
        const windowScroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

        expect(scroller.getScrollPosition()).toEqual([window.scrollX, window.scrollY]);
        scroller.scrollToPosition([0, 0]);

        expect(windowScroll).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'instant' });
    });

    it('should hand history scroll restoration over to the router', () => {
        scroller.setHistoryScrollRestoration('manual');

        expect(history.scrollRestoration).toBe('manual');

        scroller.setHistoryScrollRestoration('auto');
    });
});
