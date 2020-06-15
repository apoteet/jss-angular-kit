import { Directive, ElementRef, HostListener, Input, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import * as ts from '../data/types';

@Directive({
    selector: '[appLink]',
})
export class LinkDirective implements OnInit, AfterViewInit {
    @Input('appLink') data: ts.JssLink | ts.DataLink

    dataNew: ts.DataLink;
    isInternal = false;
    elem: HTMLElement;

    constructor(
        private elementRef: ElementRef,
        private router: Router,
    ) {
        this.elem = this.elementRef.nativeElement;
    }

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
        this.setText();
    }

    ngAfterViewInit(): void {
        const { href, url } = this.dataNew;

        // * Sitecore's scLink directive still adds an empty href attribute if no link data is present
        // * ... this prevents that behavior
        if (!url && !href) {
            this.elem.removeAttribute('href')
        }
    }

    @HostListener('click', ['$event']) onMouseEnter(e: MouseEvent): void {
        if (this.isInternal) {
            e.preventDefault();
            this.router.navigateByUrl(this.dataNew.href);
        }
    }

    setAttributes(): void {
        const { href, target, title, url } = this.dataNew;

        if (title) this.elem.setAttribute('title', title);
        if (target) this.elem.setAttribute('target', target);
        if (target === '_blank') this.elem.setAttribute('rel', 'noreferrer noopener');

        // for tel links (e.g. tel:18002224444), we need to use the url property as it contains the correct formatting
        // ... whereas the href property does not, as Sitecore automatically prepends the HTTP protocol (e.g. http://tel:18002224444)
        // ... and we fallback to using href if for some reason the url property does not exist
        if (url || href) this.elem.setAttribute('href', url || href);
    }

    setText(): void {
        if (!this.elem.childNodes.length) {
            this.elem.textContent = this.dataNew.text;
        }
    }
}
