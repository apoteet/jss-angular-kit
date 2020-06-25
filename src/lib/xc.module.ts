import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FocusTrapDirective } from './directives/focus-trap.directive';
import { LinkDirective } from './directives/link.directive';
import { SwipeDirective } from './directives/swipe.directive';

@NgModule({
    imports: [RouterModule],
    exports: [FocusTrapDirective, LinkDirective, SwipeDirective],
    declarations: [FocusTrapDirective, LinkDirective, SwipeDirective],
})
export class XcModule {}
