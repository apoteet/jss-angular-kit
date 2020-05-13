/*
    * Data Processor
        - Contains data utility methods to help process both JSS and GraphQL data into a consistent and easier-to-use format.
*/

import * as ts from './types';

interface Options {
    host: string;
}

const attrRegex = (attrName: string): RegExp => new RegExp(`${ attrName }="([^ ]*)`);
let host = '/';

export class DataProcessor {
    constructor(options: Options) {
        host = options.host;
    }
    
    processJssField(fieldValue: ts.JssField): ts.DataField | null {
        let processed: ts.DataField = null;

        if (!fieldValue) return processed;

        const fieldType = Array.isArray(fieldValue) && fieldValue.length
            ? fieldValue[0].fieldType
            : fieldValue.fieldType;

        switch (fieldType) {
            case 'Single-Line Text':
            case 'Multi-Line Text':
            case 'Rich Text':
                processed = (fieldValue as ts.JssText).value;
                break;
    
            case 'Checkbox':
                processed = (fieldValue as ts.JssCheckbox).value;
                break;
    
            case 'Image':
                processed = {
                    src: (fieldValue as ts.JssImage).value.src,
                    alt: (fieldValue as ts.JssImage).value.alt,
                    width: (fieldValue as ts.JssImage).value.width,
                    height: (fieldValue as ts.JssImage).value.height,
                };
                break;
    
            case 'General Link':
                processed = {
                    href: (fieldValue as ts.JssLink).value.href,
                    text: (fieldValue as ts.JssLink).value.text,
                    target: (fieldValue as ts.JssLink).value.target,
                    title: (fieldValue as ts.JssLink).value.title,
                    anchor: (fieldValue as ts.JssLink).value.anchor,
                };
                break;
    
            case 'Droplist':
                processed = (fieldValue as ts.JssDroplist).value;
                break;
    
            case 'Droplink':
                processed = this.processJssField(Object.values((fieldValue as ts.JssDroplink).fields)[0]);
                break;

            case 'Multilist with Search':
                processed = fieldValue[0].fields.Value.value;
                break;
    
            default:
                if (fieldValue.fieldType) {
                    console.warn(`[Data Processor] Unable to process the JSS field. The type "${ fieldValue.fieldType }" is not recognized.`);
                }
        }
    
        return processed;
    }
    
    processJssFields(fields: ts.JssFieldGroup): ts.DataFieldGroup {
        const fieldGroup = Object.entries(fields).reduce((fieldObj, [fieldName, fieldValue]) => {
            // skip over the "items" property, as it gets processed inside of processJssItem
            if (fieldName === 'items') return fieldObj;
    
            return {
                ...fieldObj,
                [fieldName]: this.processJssField(fieldValue),
            };
        }, {});
    
        return (fieldGroup as ts.DataFieldGroup);
    }
    
    // * n.b. "items" and "children" are the property names used for nested items by JSS and GraphQL, respectively
    // * ... we convert everything to use "children" for both consistency, and because it is the more intuitive of the two choices
    processJssItem(item: ts.JssComponentRendering | ts.JssItem): ts.DataItem | null {
        if (!item) return null;

        const processedItem = JSON.parse(JSON.stringify(item));
    
        if (item.fields?.items) {
            const subItems = (item.fields.items);
    
            processedItem.children = subItems.map((subItem) => this.processJssItem(subItem));
        }
    
        if (item.fields) {
            processedItem.fields = this.processJssFields(item.fields);
        }
    
        return processedItem;
    }
    
    processGqlItem(item: ts.GqlItem): ts.DataItem {
        const processedItem: ts.DataItem = {
            id: item.id,
            name: item.name,
        };

        function parseImageTag(tag: string): ts.DataImage {
            const srcMatches = attrRegex('src').exec(tag);
            const widthMatches = attrRegex('width').exec(tag);
            const heightMatches = attrRegex('height').exec(tag);
            const altMatches = attrRegex('alt').exec(tag);
        
            return {
                src: srcMatches ? `${ host }${ srcMatches[1] }` : '',
                width: widthMatches ? widthMatches[1] : '',
                height: heightMatches ? heightMatches[1] : '',
                alt: altMatches ? altMatches[1] : '',
            };
        }
        
        function parseLinkTag(tag: string): ts.DataLink {
            const hrefMatches = attrRegex('href').exec(tag);
            const targetMatches = attrRegex('target').exec(tag);
            const titleMatches = attrRegex('title').exec(tag);
            const relMatches = attrRegex('rel').exec(tag);
        
            return {
                href: hrefMatches ? hrefMatches[1] : '',
                target: targetMatches ? targetMatches[1] : '',
                title: titleMatches ? titleMatches[1] : '',
                rel: relMatches ? relMatches[1] : '',
            };
        }
    
        processedItem.fields = item.fields.reduce((fieldObj, field) => {
            let keyValPair = null;
    
            switch (field.__typename) {
                case 'TextField':
                    keyValPair = {
                        [field.name]: field.value,
                    };
    
                    break;
    
                case 'ImageField': {
                    const { src, width, height, alt } = parseImageTag(field.rendered);
    
                    keyValPair = {
                        [field.name]: {
                            src,
                            width,
                            height,
                            alt,
                        },
                    };
    
                    break;
                }
    
                case 'LinkField': {
                    const { href, target, title, rel } = parseLinkTag(field.rendered);
    
                    keyValPair = {
                        [field.name]: {
                            href,
                            target,
                            title,
                            rel,
                        },
                    };
    
                    break;
                }
    
                default:
                    console.warn(`[Data Processor] Unable to process the GraphQL field. The type "${ field.__typename }" is not recognized.`);
                    return;
            }
    
            return {
                ...fieldObj,
                ...keyValPair,
            };
        }, {});
    
        if (typeof item.children !== 'undefined') {
            processedItem.children = item.children.map(this.processGqlItem);
        }
    
        return processedItem;
    }
    
    processGqlData(data: ts.GqlItem): ts.DataItem {
        return this.processGqlItem(data);
    }
}
