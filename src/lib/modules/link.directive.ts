import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as ts from '../data/types';

@Directive({
    selector: '[appLink]',
})
export class LinkDirective implements OnInit {
    @Input('appLink') data: ts.JssLink | ts.DataLink

    dataNew: ts.DataLink;
    isInternal = false;

    constructor(
        private elem: ElementRef,
        private router: Router,
    ) {}

    ngOnInit(): void {
        if ('value' in this.data) {
            this.dataNew = this.data.value;
        } else {
            this.dataNew = this.data;
        }

        if (this.dataNew.linktype === 'internal') {
            this.isInternal = true;
        }

        this.setAttributes();
    }

    @HostListener('click', ['$event']) onMouseEnter(e: MouseEvent): void {
        if (this.isInternal) {
            e.preventDefault();
            this.router.navigateByUrl(this.dataNew.href);
        }
    }

    setAttributes(): void {
        const { href, target, title, url } = this.dataNew;

        if (title) this.elem.nativeElement.setAttribute('title', title);
        if (target) this.elem.nativeElement.setAttribute('title', title);

        // for tel links (e.g. tel:18002224444), we need to use the url property as it contains the correct formatting
        // ... whereas the href property does not, as Sitecore automatically prepends the HTTP protocol (e.g. http://tel:18002224444)
        // ... and we fallback to using href if for some reason the url property does not exist
        this.elem.nativeElement.setAttribute('href', url || href);
    }
}
