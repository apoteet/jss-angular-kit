import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FocusTrapDirective } from './directives/focus-trap.directive';
import { LinkDirective } from './directives/link.directive';
import { ScrollToDirective } from './directives/scroll-to.directive';
import { SwipeDirective } from './directives/swipe.directive';
import { RawHtmlPipe } from './pipes/raw-html';

@NgModule({
    imports: [RouterModule],

    exports: [
        FocusTrapDirective,
        LinkDirective,
        RawHtmlPipe,
        ScrollToDirective,
        SwipeDirective,
    ],

    declarations: [
        FocusTrapDirective,
        LinkDirective,
        RawHtmlPipe,
        ScrollToDirective,
        SwipeDirective,
    ],
})
export class XcModule {}
