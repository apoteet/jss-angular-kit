import { Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'rawHtml' })
export class RawHtmlPipe {
    constructor(private sanitizer: DomSanitizer) {}

    transform(html): any {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
