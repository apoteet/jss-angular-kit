import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';

@Directive({
    selector: '[scrollTo]',
})
export class ScrollToDirective implements AfterViewInit, OnDestroy {
    @Input('scrollTo') cssString: string;

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
        const target = document.querySelector(this.cssString);

        if (!target) {
            console.warn(`Unable to scroll the page. An element with matching the CSS string "${ this.cssString }" could not be found.`);
            return;
        }

        const yCoord = target.getBoundingClientRect().top + window.scrollY;

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
