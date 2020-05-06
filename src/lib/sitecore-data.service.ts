/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { DataProcessor } from './data-processor';
import * as ts from './types';

// we need to use the webpack loader require syntax in order to load the GraphQL query
const ItemQuery = require('graphql-tag/loader!./item-query.gql');

/**
 * Recursively searches through JSS items until a match is found
 *
 * @param {array} jssItems - An array of JSS items.
 * @param {function} isMatch - A callback function which gets passed the CURRENT item, and should return either true or false.
 * @param {function} [getValue] - A callback function which gets passed the FOUND item. Use this if you want to return something from the item, instead of the item itself.
 *
 * @returns The first item that matches (or the return value of getValue if specified), otherwise null.
 *
 * @example
 *     findInJss(rendering.fields.items, (i: Item) => i.name === 'foo')
 */
function findInJss(jssItems: ts.JssItem[], isMatch: Function): ts.JssItem | null;
function findInJss(jssItems: ts.JssItem[], isMatch: Function, getValue: Function): ts.JssField | null;
function findInJss(jssItems: ts.JssItem[], isMatch: Function, getValue?: Function): any {
    const itemQueue = [...jssItems];

    while (itemQueue.length) {
        const currentItem = itemQueue.shift();

        if (isMatch(currentItem)) {
            return getValue ? getValue(currentItem) : currentItem;
        }

        if (currentItem.fields.items) {
            for (const childItem of currentItem.fields.items) {
                itemQueue.push(childItem);
            }
        }
    }
}

@Injectable({
    providedIn: 'root',
})
export class SitecoreDataService {
    jssGraphQLService: any;
    dp: DataProcessor;

    init(options: any): void {
        this.jssGraphQLService = options.graphQLService;
        this.dp = new DataProcessor({ host: options.host });
    }

    fetch(guid: string): Observable<ts.DataItem> {
        if (!guid) {
            console.warn('[SDS] One or more required fields are missing. Did you remember to specify an ID?');
            return;
        }

        const queryOptions = {
            query: ItemQuery,
            variables: { path: guid },
        };

        return this.jssGraphQLService
            .query(queryOptions)
            .pipe(first())
            .pipe(map((resp: any) => resp.data.item))
            .pipe(map((data: any) => this.dp.processGqlData(data)));
    }

    get(rendering: ts.JssComponentRendering): ts.DataComponent;
    get(rendering: ts.JssComponentRendering, itemName: string): ts.DataItem | null;
    get(rendering: ts.JssComponentRendering, itemName: string | null, fieldName: string): ts.DataField | null;
    get(rendering: ts.JssComponentRendering, itemName?: string, fieldName?: string): any {

        switch (true) {
            // empty
            case !rendering:
                console.warn('[SDS] Please specify a rendering.');
                return null;

            // rendering
            case !itemName && !fieldName:
                return this.dp.processJssItem(rendering);

            // rendering + itemName
            case !!itemName && !fieldName: {
                const item = findInJss(rendering.fields.items, (i: ts.JssItem) => i.name === itemName);
                return this.dp.processJssItem(item);
            }

            // rendering + fieldName
            case !itemName && !!fieldName: {
                const item = rendering as unknown as ts.JssItem;
                const field = findInJss([item], (i: ts.JssItem) => !!i.fields[fieldName], (i: ts.JssItem) => i.fields[fieldName]);
                return this.dp.processJssField(field);
            }

            // rendering + itemName + fieldName
            default:
                const item = findInJss(rendering.fields.items, (i: ts.JssItem) => i.name === itemName);
                const field = findInJss([item], (i: ts.JssItem) => !!i.fields[fieldName], (i: ts.JssItem) => i.fields[fieldName]);
                return this.dp.processJssField(field);
        }
    }
}
