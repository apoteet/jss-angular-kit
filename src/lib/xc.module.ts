import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FocusTrapDirective } from './directives/focus-trap.directive';
import { LinkDirective } from './directives/link.directive';

@NgModule({
    imports: [RouterModule],
    exports: [FocusTrapDirective, LinkDirective],
    declarations: [FocusTrapDirective, LinkDirective],
})
export class XcModule {}
