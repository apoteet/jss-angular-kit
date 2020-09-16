/*
    * Data Processor
        - Contains data utility methods to help process both JSS and GraphQL data into a consistent and easier-to-use format.
*/

import * as ts from '../data/types';

interface Options {
    host: string;
}

const attrRegex = (attrName: string): RegExp => new RegExp(`${ attrName }=\\"([^ ]*)\\"`);
let host = '/';

export class DataProcessor {
    constructor(options: Options) {
        host = options.host;
    }
    
    processJssField(fieldValue: ts.JssField | ts.JssField[]): ts.DataField | ts.DataField[] | ts.DataFieldGroup | null {
        let processed: ts.DataField | ts.DataFieldGroup = null;

        if (!fieldValue) return processed;

        if (Array.isArray(fieldValue)) {
            return fieldValue.map((fieldValueItem) => this.processJssField(fieldValueItem)) as ts.DataField[];
        }

        const fieldType = fieldValue.fieldType

        switch (fieldType) {    
            case 'Checkbox':
                processed = (fieldValue as ts.JssCheckbox).value;
                break;

            case 'Droplink':
                processed = Object.entries((fieldValue as ts.JssDroplink).fields).reduce((acc, curr) => {
                    const [fieldName, fieldVal] = curr;

                    acc[fieldName] = this.processJssField(fieldVal) as ts.DataField;

                    return acc;
                }, {} as ts.DataFieldGroup);
                break;
    
            case 'Droplist':
                processed = (fieldValue as ts.JssDroplist).value;
                break;

            case 'Droptree':
                processed = Object.entries((fieldValue as ts.JssDroptree).fields).reduce((acc, curr) => {
                    const [fieldName, fieldVal] = curr;

                    acc[fieldName] = this.processJssField(fieldVal) as ts.DataField;

                    return acc;
                }, {} as ts.DataFieldGroup);
                break;

            case 'General Link':
                processed = {
                    href: (fieldValue as ts.JssLink).value.href,
                    text: (fieldValue as ts.JssLink).value.text,
                    url: (fieldValue as ts.JssLink).value.url,
                    anchor: (fieldValue as ts.JssLink).value.anchor,
                    linktype: (fieldValue as ts.JssLink).value.linktype,
                    target: (fieldValue as ts.JssLink).value.target,
                    title: (fieldValue as ts.JssLink).value.title,
                    querystring: (fieldValue as ts.JssLink).value.querystring,
                };
                break;

            case 'Image':
                processed = {
                    src: (fieldValue as ts.JssImage).value.src,
                    alt: (fieldValue as ts.JssImage).value.alt,
                    width: (fieldValue as ts.JssImage).value.width,
                    height: (fieldValue as ts.JssImage).value.height,
                };
                break;

            case 'Integer':
                processed = (fieldValue as ts.JssInteger).value;
                break;

            case 'Multi-Line Text':
                processed = (fieldValue as ts.JssText).value;
                break;

            case 'Multilist with Search':
                processed = Object.entries((fieldValue as ts.JssMultilistSearch).fields).reduce((acc, curr) => {
                    const [fieldName, fieldVal] = curr;

                    acc[fieldName] = this.processJssField(fieldVal) as ts.DataField;

                    return acc;
                }, {} as ts.DataFieldGroup);
                break;

            case 'Number':
                processed = (fieldValue as ts.JssNumber).value;
                break;

            case 'Rich Text':
                processed = (fieldValue as ts.JssText).value;
                break;

            case 'Single-Line Text':
                processed = (fieldValue as ts.JssText).value;
                break;

            case 'Treelist': 
                processed = Object.entries((fieldValue as ts.JssTreeList).fields).reduce((acc, curr) => {
                    const [fieldName, fieldVal] = curr;

                    acc[fieldName] = this.processJssField(fieldVal) as ts.DataField;

                    return acc;
                }, {} as ts.DataFieldGroup);
                break;
    
            default:
                if ((fieldValue as ts.JssField).fieldType) {
                    console.warn(`[Data Processor] Unable to process the JSS field. The type "${ (fieldValue as ts.JssField).fieldType }" is not recognized.`);
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
            processedItem.fields = this.processJssFields(item.fields as ts.JssFieldGroup);
        }
    
        return processedItem;
    }
    
    processGqlItem(item: ts.GqlItem): ts.DataItem {
        const processedItem: ts.DataItem = {
            id: item.id,
            name: item.name,
        };

        function parseImageTag(field: ts.GqlField): ts.DataImage {
            const srcMatches = attrRegex('src').exec(field.rendered);
            const widthMatches = attrRegex('width').exec(field.rendered);
            const heightMatches = attrRegex('height').exec(field.rendered);
            const altMatches = attrRegex('alt').exec(field.rendered);
        
            return {
                src: srcMatches ? `${ host }${ srcMatches[1] }` : '',
                width: widthMatches ? widthMatches[1] : '',
                height: heightMatches ? heightMatches[1] : '',
                alt: altMatches ? altMatches[1] : '',
            };
        }
        
        function parseLinkTag(field: ts.GqlField): ts.DataLink {
            // * n.b. the href only exists on field.rendered, every other property exists on field.value
            const hrefMatches = attrRegex('href').exec(field.rendered);
            const targetMatches = attrRegex('target').exec(field.value);
            const titleMatches = attrRegex('title').exec(field.value);
            const textMatches = attrRegex('text').exec(field.value);
            const anchorMatches = attrRegex('anchor').exec(field.value);
            const linkTypeMatches = attrRegex('linktype').exec(field.value);
        
            return {
                href: hrefMatches ? hrefMatches[1] : '',
                target: targetMatches ? targetMatches[1] : '',
                title: titleMatches ? titleMatches[1] : '',
                text: textMatches ? textMatches[1] : '',
                anchor: anchorMatches ? anchorMatches[1] : '',
                linktype: linkTypeMatches ? linkTypeMatches[1] : '',
            };
        }
    
        processedItem.fields = item.fields.reduce((fieldObj, field) => {
            let keyValPair = null;

            // skip the system-generated Sitecore fields
            if (field.name.startsWith('__')) return fieldObj;
    
            switch (field.__typename) {
                case 'TextField':
                    keyValPair = {
                        [field.name]: field.value,
                    };
    
                    break;
    
                case 'ImageField': {
                    const { src, width, height, alt } = parseImageTag(field);
    
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
                    const { href, text, url, anchor, linktype, target, title, querystring } = parseLinkTag(field);
    
                    keyValPair = {
                        [field.name]: {
                            href,
                            text,
                            url,
                            anchor,
                            linktype,
                            target,
                            title,
                            querystring,
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
