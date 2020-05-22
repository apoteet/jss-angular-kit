import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LinkDirective } from './directives/link.directive';

@NgModule({
    imports: [RouterModule],
    exports: [LinkDirective],
    declarations: [LinkDirective],
})
export class XcModule {}
