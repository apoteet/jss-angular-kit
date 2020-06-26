/*

    Swipe Directive
        - Provides an easy mechanism for detecting and reacting to swipe events.

        [Example]

            onSwipe(direction: string) {
                if (direction === 'left') {
                    console.log('the user swiped left');
                } else {
                    console.log('the user swiped right');
                }
            }

            <!-- HTML -->
            <div (swipe)="onSwipe($event)"></div>

*/

import { AfterViewInit, Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';

@Directive({
    selector: '[swipe]',
})
export class SwipeDirective implements AfterViewInit, OnDestroy {
    @Output('swipe') eventEmitter: EventEmitter<string> = new EventEmitter();

    elem: HTMLElement;
    isSwiping = false;
    lastTouchX: number;

    constructor(private elementRef: ElementRef) {
        this.elem = this.elementRef.nativeElement;
    }

    ngAfterViewInit(): void {
        this.elem.addEventListener('touchstart', this.onTouchStart);
        this.elem.addEventListener('touchmove', this.onTouchMove);
    }

    ngOnDestroy(): void {
        this.elem.removeEventListener('touchstart', this.onTouchStart);
        this.elem.removeEventListener('touchmove', this.onTouchMove);
    }

    onTouchStart = (e: TouchEvent): void => {
        this.lastTouchX = e.changedTouches[0].clientX;
        this.isSwiping = true;
    }

    onTouchMove = (e: TouchEvent): void => {
        const touchX = e.changedTouches[0].clientX;
        const threshold = 50; // minimum distance in pixels that determines a "swipe" has occurred

        if (!this.isSwiping) return;

        if (touchX <= this.lastTouchX - threshold) {
            this.isSwiping = false;
            this.eventEmitter.emit('left');
        }

        if (touchX >= this.lastTouchX + threshold) {
            this.isSwiping = false;
            this.eventEmitter.emit('right');
        }
    }
}
