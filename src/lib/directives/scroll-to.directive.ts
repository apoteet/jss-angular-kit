/*

    Scroll-To Directive
        - Provides an easy way to "smooth" scroll to an element, if the browser supports it.
        - You can pass in a CSS selector for the element you want to scroll towards.
        - Or you can pass in an options object. Check out the ScrollOptions interface for more information.

        [Example]

            <button type="button" scrollTo="#overview">Scroll to Overview

*/

import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ScrollOptions } from '../data/types';

@Directive({
    selector: '[scrollTo]',
})
export class ScrollToDirective implements OnInit, AfterViewInit, OnDestroy {
    @Input('scrollTo') input: string | ScrollOptions;

    elem: HTMLElement;
    target: string;
    offset = 0;

    constructor(private elementRef: ElementRef) {
        this.elem = this.elementRef.nativeElement;
    }

    ngOnInit(): void {
        if (this.input && typeof this.input === 'object') {
            this.target = this.input.target;
            this.offset = this.input.offset;
        } else {
            this.target = this.input as string;
        }
    }

    ngAfterViewInit(): void {
        this.elem.addEventListener('click', this.onScroll);
    }

    ngOnDestroy(): void {
        this.elem.removeEventListener('click', this.onScroll);
    }

    onScroll = (): void => {
        const smoothScrollSupport = 'scrollBehavior' in document.documentElement.style;
        const target = document.querySelector(this.target);

        if (!target) {
            console.warn(`Unable to scroll the page. An element with matching the CSS string "${ this.target }" could not be found.`);
            return;
        }

        const yCoord = target.getBoundingClientRect().top + window.scrollY + this.offset;

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
