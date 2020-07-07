import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FocusTrapDirective } from './directives/focus-trap.directive';
import { LinkDirective } from './directives/link.directive';
import { ScrollToDirective } from './directives/scroll-to.directive';
import { SwipeDirective } from './directives/swipe.directive';

@NgModule({
    imports: [RouterModule],

    exports: [
        FocusTrapDirective,
        LinkDirective,
        ScrollToDirective,
        SwipeDirective,
    ],

    declarations: [
        FocusTrapDirective,
        LinkDirective,
        ScrollToDirective,
        SwipeDirective,
    ],
})
export class XcModule {}
