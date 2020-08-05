/*

    Mobile Detection Service
        - Fires a callback function whenever the user switches between desktop and mobile.
        - Note that the callback will be fired once when the page is first loaded.

        [EXAMPLES]

            import { MobileDetectionService } from '@/services/mobile-detection.service';

            @Component({
                ...
                providers: [MobileDetectionService],
            })
            export class MyComponent {
                constructor(private mds: MobileDetectionService) {
                    this.mds.subscribe(onScreenChange);
                }

                onScreenChange(isMobile): void {
                    if (isMobile) {
                        console.log('the screen size is below the mobile breakpoint');
                    } else {
                        console.log('the screen size is above the mobile breakpoint');
                    }
                }
            }


        ... note that if you want to change the default breakpoint (1199px) you can do so by calling the setBreakpoint method BEFORE calling the subscribe method. For example:

            this.mds.setBreakpoint(767);
            this.mds.subscribe(onScreenChange);

*/

import { Injectable, OnDestroy } from '@angular/core';
import { WindowEventService } from './window-event.service';

@Injectable()
export class MobileDetectionService implements OnDestroy {
    callback: Function = function noop() { /**/ }
    mobileBreakpoint = 1199;
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

    setBreakpoint(pixels: number): void {
        this.mobileBreakpoint = pixels;
    }

    subscribe(callback: Function): void {
        this.callback = callback;

        if (typeof window !== 'undefined') this.detectMobile();
    }

    detectMobile = (): void => {
        const isMobile = window.innerWidth <= this.mobileBreakpoint;

        this.callback(isMobile);
    }

    onResize = (): void => {
        // debounce the requests for better performance
        window.clearTimeout(this.resizeTimeoutId);

        this.resizeTimeoutId = window.setTimeout(this.detectMobile, 250);
    }
}
