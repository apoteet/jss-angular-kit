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

    off(eventName: string, callback: EventListener): void {
        if (typeof window === 'undefined' || !this.eventHub[eventName]) return;

        const eventIndex = this.eventHub[eventName].findIndex(cb => cb === callback);

        if (eventIndex > -1) {
            this.eventHub[eventName].splice(eventIndex, 1);
            window.removeEventListener(eventName, callback);
        }
    }

    ngOnDestroy(): void {
        if (typeof window === 'undefined') return;

        Object.entries(this.eventHub).forEach(([eventName, callbacks]) => {
            callbacks.forEach((cb) => window.removeEventListener(eventName, cb));
        });
    }
}
