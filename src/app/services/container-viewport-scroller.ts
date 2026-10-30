import { DOCUMENT, Injectable, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';

// The page scrolls inside mat-sidenav-content, not the window, and the
// router's default scroller only ever moves the window. Every navigation kept
// the previous page's offset: a card picked low on the home page opened its
// serie halfway down. This scroller drives the sidenav content instead, so the
// router's own restoration applies: top on a new page, the saved offset on
// back and forward, and anchors scrolled into view.
const SCROLL_CONTAINER = 'mat-sidenav-content';

@Injectable()
export class ContainerViewportScroller implements ViewportScroller {
    private readonly document = inject(DOCUMENT);
    private offset: () => [number, number] = () => [0, 0];

    setOffset(offset: [number, number] | (() => [number, number])): void {
        this.offset = Array.isArray(offset) ? () => offset : offset;
    }

    getScrollPosition(): [number, number] {
        const container = this.container();
        if (container) {
            return [container.scrollLeft, container.scrollTop];
        }

        const view = this.document.defaultView;
        return view ? [view.scrollX, view.scrollY] : [0, 0];
    }

    scrollToPosition(position: [number, number], options?: ScrollOptions): void {
        // Instant unless told otherwise: a new page should land in place, not
        // glide up from wherever the previous one was left.
        (this.container() ?? this.document.defaultView)?.scrollTo({
            left: position[0],
            top: position[1],
            behavior: options?.behavior ?? 'instant',
        });
    }

    scrollToAnchor(anchor: string, options?: ScrollOptions): void {
        const target =
            this.document.getElementById(anchor) ?? this.document.getElementsByName(anchor)[0];
        const container = this.container();
        if (!target || !container) {
            target?.scrollIntoView({ block: 'start', ...options });
            return;
        }

        // Measured against the container rather than left to scrollIntoView,
        // so the offset (the sticky toolbar, when set) is honoured.
        const [offsetLeft, offsetTop] = this.offset();
        const [left, top] = this.layoutPosition(target, container);
        container.scrollTo({
            left: left - offsetLeft,
            top: top - offsetTop,
            behavior: options?.behavior,
        });
    }

    setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void {
        const history = this.document.defaultView?.history;
        if (history) {
            history.scrollRestoration = scrollRestoration;
        }
    }

    private container(): HTMLElement | null {
        return this.document.querySelector<HTMLElement>(SCROLL_CONTAINER);
    }

    // Where the target sits in the container's content, from the layout
    // offsets rather than the painted box: a section still waiting for its
    // scroll-driven reveal is drawn 26px low, and measuring that would land
    // the page 26px past it. Falls back to the painted box when the offset
    // chain does not lead to the container.
    private layoutPosition(target: HTMLElement, container: HTMLElement): [number, number] {
        let left = 0;
        let top = 0;
        let element: Element | null = target;
        while (element instanceof HTMLElement && element !== container) {
            left += element.offsetLeft;
            top += element.offsetTop;
            element = element.offsetParent;
        }
        if (element === container) {
            return [left, top];
        }

        const targetBox = target.getBoundingClientRect();
        const containerBox = container.getBoundingClientRect();
        return [
            targetBox.left - containerBox.left + container.scrollLeft,
            targetBox.top - containerBox.top + container.scrollTop,
        ];
    }
}
