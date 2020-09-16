// * JSS data types
export interface JssLayoutServiceData {
    sitecore: JssLayoutServiceContextData & {
        route: JssRouteData;
    };
}

export interface JssLayoutServiceContextData {
    context: {
        pageEditing?: boolean;
        language?: string;
        pageState?: 'preview' | 'edit' | 'normal';
        visitorIdentificationTimestamp?: number;
        site?: {
            name?: string;
        };
        [key: string]: any;
    };
}

export interface JssRouteData {
    name: string;
    displayName?: string;
    fields?: {
        [name: string]: JssField;
    };
    databaseName?: string;
    deviceId?: string;
    itemLanguage?: string;
    itemVersion?: number;
    layoutId?: string;
    templateId?: string;
    templateName?: string;
    placeholders: JssPlaceholdersData;
    itemId?: string;
}

// placeholder contents (name: placeholder name, then array of components within that placeholder name)
export declare type JssPlaceholdersData<TYPEDNAME extends string = string> = {
    [P in TYPEDNAME]: Array<JssComponentRendering & JssHtmlElementRendering>;
};

export type JssComponentFields = JssComponentFieldsA & JssComponentFieldsB;

export interface JssComponentFieldsA {
    [name: string]: JssField;
}

export interface JssComponentFieldsB {
    items: JssItem[];
}

export interface JssComponentParams {
    [name: string]: string;
}

export interface JssComponentRendering {
    componentName: string;
    dataSource?: string;
    uid?: string;
    placeholders?: JssPlaceholdersData;
    fields?: JssComponentFields & JssForm;
    params?: JssComponentParams;
}

// HTML content used to support Sitecore Experience Editor
export interface JssHtmlElementRendering {
    name: string;
    type?: string;
    contents: string | null;
    attributes: {
        [name: string]: string | undefined;
    };
}

export declare type JssGenericFieldValue = string | boolean | number | {
    [key: string]: any;
} | Array<{
    [key: string]: any;
}>;

export type JssFieldGroup = JssFieldGroupA & JssFieldGroupB & JssFieldGroupC;

export interface JssFieldGroupA {
    [k: string]: JssField;
}

export interface JssFieldGroupB {
    [k: string]: JssField[];
}

export interface JssFieldGroupC {
    items: JssItem[];
}

export type JssField = JssFieldGeneric
    & JssCheckbox
    & JssDroplink
    & JssDroplist
    & JssDroptree
    & JssImage
    & JssInteger
    & JssLink
    & JssMultilistSearch
    & JssNumber
    & JssText

export interface JssFieldGeneric<T = JssGenericFieldValue> {
    value: T;
    fieldType: string;
    editable?: string;
}

export interface JssItem {
    name: string;
    displayName?: string;
    fields: JssFieldGroup;
}

export interface JssPlaceholderData {
    name: string;
    path: string;
    elements: Array<JssHtmlElementRendering | JssComponentRendering>;
}

export interface JssText {
    fieldType: string;
    value: string;
}

export interface JssNumber {
    fieldType: string;
    value: string;
}

export interface JssInteger {
    fieldType: string;
    value: string;
}

export interface JssImage {
    fieldType: string;
    value: {
        src: string;
        alt?: string;
        width?: string;
        height?: string;
    };
}

export interface JssLink {
    fieldType: string;
    value: {
        href: string;
        text: string;
        url?: string;
        anchor: string;
        linktype: string;
        target?: string;
        title?: string;
        querystring?: string;
    };
}

export interface JssDroplink {
    fieldType: string;
    id: string;
    url: string;
    fields: JssFieldGroup;
}

export interface JssDroplist {
    fieldType: string;
    value: string;
}

export interface JssDroptree {
    fieldType: string;
    id: string;
    url: string;
    fields: JssFieldGroup | JssField[];
}

export interface JssMultilistSearch<T = JssFieldGroup> {
    fieldType: string;
    id: string;
    fields: T;
}

export interface JssTreeList {
    fieldType: string;
    fields: JssFieldGroup;
}

export interface JssCheckbox {
    fieldType: string;
    value: string;
}

export interface JssForm {
    htmlPrefix: string;
    formSessionId: JssFormFieldHtml;
    formItemId: JssFormFieldHtml;
    pageItemId: JssFormFieldHtml;
    antiForgeryToken: JssFormFieldHtml;
    metadata: JssFormMetadata;
    fields: JssFormField[];
}

export interface JssFormMetadata {
    isTrackingEnabled: boolean;
    title: string;
    cssClass: string;
    itemId: string;
}

export interface JssFormField {
    model: JssFormFieldModel;
    fields?: JssFormField[];
}

export interface JssFormFieldModel {
    itemId: string;
    name: string;
    templateId: string;
    fieldTypeItemId: string;
    cssClass: string;
    placeholderText?: string;
    min?: number|string;
    minLength?: string;
    max?: number|string;
    maxLength?: string;
    required?: boolean;
    rows?: boolean;
    step?: number;
    title?: string;
    value?: string;
    items: JssFormSelect[];
    validationDataModels: JssFormFieldValidation[];
}

export interface JssFormFieldHtml {
    name: string;
    id: string;
    value: string;
}

export interface JssFormFieldValidation {
    itemId: string;
    message: string;
    name: string;
}

interface JssFormSelect {
    itemId: string;
    selected: boolean;
    text: string;
    value: string;
}


// * GraphQL data types
export interface GqlItemResponse {
    data: {
        contextItem: GqlItem;
    };
}

export interface GqlItem {
    id: string;
    name: string;
    fields?: GqlField[];
    children?: GqlItem[];
}

export interface GqlField {
    __typename: string;
    name: string;
    value: string;
    rendered: string;
}


// * processed data types
export type DataFieldGroup = DataFieldGroupA & DataFieldGroupB;

export interface DataFieldGroupA {
    [k: string]: DataField;
}

export interface DataFieldGroupB {
    items: DataItem[];
}

export type DataField = string
    | boolean
    | DataImage
    | DataLink
    | DataItem[]
    | DataField[];

export interface DataRoute {
    name: string;
    displayName?: string;
    fields?: JssFieldGroup;
    databaseName?: string;
    deviceId?: string;
    itemLanguage?: string;
    itemVersion?: number;
    layoutId?: string;
    templateId?: string;
    templateName?: string;
    placeholders: DataPlaceholder;
    itemId?: string;
}

export interface DataPlaceholder {
    [key: string]: DataComponent[];
}

export interface DataComponent {
    uid: string;
    componentName: string;
    dataSource: string;
    fields: DataFieldGroup;
    params: {};
    children: DataItem[];
    placeholders: {};
}

export interface DataItem {
    id: string;
    name: string;
    fields?: DataFieldGroup;
    children?: DataItem[];
}

export interface DataImage {
    src: string;
    width: string;
    height: string;
    alt: string;
}

export interface DataLink {
    href: string;
    text: string;
    url?: string;
    anchor: string;
    linktype: string;
    target?: string;
    title?: string;
    querystring?: string;
}


// * directive data types
export interface ScrollOptions {
    /**
     * A CSS selector string for the element you want to scroll towards.
     */
    target?: string;

    /**
     * Optional. An offset (in pixels) that should be applied to the target scroll coordinate.
     */
    offset?: number;
}
