/*

    Mobile Detection Service
        - Register callback functions to fire for the mobile and desktop breakpoints.
        - Each callback (e.g. either the "desktop" or "mobile") will be fired when the page is loaded, and again if and when the user resizes their screen past the specified breakpoint.

        [Example]

            import { MobileDetectionService } from '@/services/mobile-detection.service';

            @Component({
                ...
                providers: [MobileDetectionService],
            })
            export class MyComponent {
                constructor(private mds: MobileDetectionService) {
                    this.mds.init(this.onMobile, this.onDesktop, 1199);
                }

                onMobile(): void {
                    ...
                }

                onDesktop(): void {
                    ...
                }
            }

*/

import { Injectable, OnDestroy } from '@angular/core';
import { WindowEventService } from './window-event.service';

@Injectable()
export class MobileDetectionService implements OnDestroy {
    mobileBreakpoint = 1199;
    mobileCallback: Function = function noop() { /**/ }
    desktopCallback: Function = function noop() { /**/ }
    resizeTimeoutId = 0;

    constructor(private wes: WindowEventService) {
        this.wes.on('resize', this.onResize);
    }

    ngOnDestroy(): void {
        // normally the Window Event Service (WES) would automatically remove event listeners
        // ... except in this case we're using the global instance of the WES (necessary since we're using it inside of another service)
        // ... which also means the WES ngOnDestroy lifecycle hook never gets called
        this.wes.off('resize', this.onResize);
    }

    init(onMobile: Function, onDesktop: Function, breakpoint?: number): void {
        if (typeof onMobile === 'function') this.mobileCallback = onMobile;
        if (typeof onDesktop === 'function') this.desktopCallback = onDesktop;
        
        this.mobileBreakpoint = breakpoint || this.mobileBreakpoint;

        if (typeof window !== 'undefined') this.detectMobile();
    }

    detectMobile = (): void => {
        const isMobile = window.innerWidth <= this.mobileBreakpoint;

        if (isMobile) {
            this.mobileCallback();
        } else {
            this.desktopCallback();
        }
    }

    onResize = (): void => {
        // debounce the requests for better performance
        window.clearTimeout(this.resizeTimeoutId);

        this.resizeTimeoutId = window.setTimeout(this.detectMobile, 250);
    }
}
