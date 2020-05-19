import { Component, OnInit, Input } from '@angular/core';
import { SitecoreDataService, types as ts } from '@xcentium/jss-angular-kit';

@Component({
    selector: '<%= selector %>',
    templateUrl: './<%= dasherize(name) %>.component.html',
    styleUrls: ['./<%= dasherize(name) %>.component.<%= styleext %>'],
})
export class <%= classify(name) %>Component implements OnInit {
    @Input() rendering: ts.JssComponentRendering;

    constructor(private sds: SitecoreDataService) {}

    ngOnInit(): void {
        console.log('[<%= classify(name) %>]', this.sds.get(this.rendering));
    }
}
