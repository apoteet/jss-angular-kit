/*

    Scroll-To Directive
        - Provides an easy way to "smooth" scroll to an element, if the browser supports it.
        - For the scrollTo attribute, pass the ID of the element you want to scroll towards.
        - For the scrollToOffset attribute, pass an offset (in pixels) that should be applied to the target scroll coordinate.

        [Example]

            <button type="button" scrollTo="overview" scrollToOffset="200">Scroll to Overview</button>

*/

import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';

@Directive({
    selector: '[scrollTo]',
})
export class ScrollToDirective implements AfterViewInit, OnDestroy {
    @Input('scrollTo') target: string;
    @Input('scrollToOffset') offset: string | number;

    elem: HTMLElement;

    constructor(private elementRef: ElementRef) {
        this.elem = this.elementRef.nativeElement;
    }

    ngAfterViewInit(): void {
        this.elem.addEventListener('click', this.onScroll);
    }

    ngOnDestroy(): void {
        this.elem.removeEventListener('click', this.onScroll);
    }

    onScroll = (): void => {
        const smoothScrollSupport = 'scrollBehavior' in document.documentElement.style;
        const target = document.getElementById(this.target);
        const offset = !Number.isNaN(Number(this.offset)) ? Number(this.offset) : 0;

        if (!target) {
            console.warn(`Unable to scroll the page. An element with matching the ID "${ this.target }" could not be found.`);
            return;
        }

        const yCoord = target.getBoundingClientRect().top + window.scrollY + offset;

        if (smoothScrollSupport) {
            window.scrollTo({
                top: yCoord,
                behavior: 'smooth',
            });
        } else {
            window.scrollTo(0, yCoord);
        }
    }
}
