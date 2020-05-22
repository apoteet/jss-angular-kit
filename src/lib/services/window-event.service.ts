import { Injectable, OnDestroy } from '@angular/core';

interface EventHub {
    [eventName: string]: EventListener[];
}

@Injectable()
export class WindowEventService implements OnDestroy {
    private eventHub: EventHub = {}

    on(eventName: string, callback: EventListener): void {
        // * n.b. always check for window in case SSR is being used
        if (typeof window === 'undefined') return;

        this.eventHub[eventName] = this.eventHub[eventName] || [];
        this.eventHub[eventName].push(callback);

        window.addEventListener(eventName, callback);
    }

    ngOnDestroy(): void {
        if (typeof window === 'undefined') return;

        Object.entries(this.eventHub).forEach(([eventName, callbacks]) => {
            callbacks.forEach((cb) => window.removeEventListener(eventName, cb));
        });
    }
}
