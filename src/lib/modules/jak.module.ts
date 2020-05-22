import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LinkDirective } from './link.directive';

@NgModule({
    imports: [RouterModule],
    exports: [LinkDirective],
    declarations: [LinkDirective],
})
export class JakModule {}
