# JSS Angular Kit
A collection of helper functions, directives, services and type definitions to assist with Angular projects that use Sitecore JSS. The JSS Angular Kit includes the following:

- Sitecore Data Service
- Window Event Service
- Link Directive
- Custom Types
- Component Schematics

... You can read more about each one further down in the README.

<br>

## Installation
1) Run `npm i @xcentium/jss-angular-kit`.
2) Inside of your root app component (which is named `app.component.ts` by default), initialize the Sitecore Data Service like so:

```
import { SitecoreDataService } from '@xcentium/jss-angular-kit';
import { JssGraphQLService } from '../path/to/jss-graphql.service';
import * as jssConfig from '../path/to/scjssconfig.json';

export class MyAppComponent {
    constructor(sds: SitecoreDataService, jssGraphQLService: JssGraphQLService,) {
        sds.init({
            graphQLService: jssGraphQLService,
            host: jssConfig.sitecore.layoutServiceHost,
        });
    }
}
```

... where of course the `path/to` portion of the import statements are updated appropriately.

<br>

## Usage

### Working with JSS Data
You can use the `get` method to fetch Sitecore data via JSS. The data is [processed](#processed-data) before being returned, in order to make it more consistent, predictable, and easier to parse.

**Examples**
```
// getting a rendering
this.sds.get(this.rendering)

// getting an item
this.sds.get(this.rendering, 'SocialMedia')

// getting a field from an item
this.sds.get(this.rendering, 'SocialMedia', 'Facebook')

// getting a field from a rendering
this.sds.get(this.rendering, null, 'Summary')
```

<br>

### Working with GraphQL Data
You can use the `fetch` method to fetch Sitecore data via GraphQL. Similar to the previous method, the data is also [processed](#processed-data) before being returned.

**Example**
```
// fetch a Sitecore item by GUID
this.sds.fetch('{83E04F4B-3A98-402F-840B-AEFA415FD147}')
```

<br>

### Working with Window Events
While using window-based events (e.g. `window.addEventListener('click')`) may appear to be trivial - there are a couple of gotchas to keep in mind when using them on Angular applications:

1. Any references to `window` will throw errors during server-side rendering, since the `window` object does not exist in that environment.

2. You must remember to "clean up" after yourself to help avoid memory leaks. This means removing your event listeners inside the `ngOnDestroy` lifecycle hook.

3. When removing your event listeners, rule #1 still applies.

This package contains a "Window Event Service" which makes it easier to work with window-based events without having to worry about the above. Here's an example:

```
import { Component, OnInit } from '@angular/core';
import { WindowEventService } from '@xcentium/jss-angular-kit';

@Component({
    ...
    providers: [WindowEventService],
})
class MyComponent implements OnInit {
    constructor(private wes: WindowEventService) {}

    ngOnInit(): void {
        this.wes.on('resize', this.onResize);
    }

    onResize(): void {
        // do something on resize
    }
}
```

... note that you don't have to worry about removing your event listener, as the service will take care of that for you.

<br>

### Using the Custom Types
The OOTB Sitecore JSS type definitions are a bit unwieldy to work with as you'll find yourself constantly coercing types to prevent the TypeScript compiler from yelling at you. We've redefined their types with some slight variations to make it easier to work with JSS data.

To use our type definitions, simply import `types` from the library. Aliasing it to `ts` is optional but helps keeps the code less verbose.

**Example**
```
import { SitecoreDataService, types as ts } from '@xcentium/jss-angular-kit';

constructor(private sds: SitecoreDataService) {}

export class MyComponent implements OnInit {
    @Input() rendering: ts.JssComponentRendering;

    myItem: ts.DataItem;

    ngOnInit(): void {
        this.myItem = this.sds.get(this.rendering, 'SomeItemName');
    }
}
```

<br>

### Working with Processed Data
The data returned by `get` and `fetch` is processed before being returned in order to **(a)** address inconsistencies between the data structures returned by the JSS endpoint and GraphQL, and **(b)** to make it easier to grab the data properties you need.

More specifically:

- JSS field values are no longer nested inside of a "value" property (e.g. `Image.src` instead of `Image.value.src`).
- Child items are now _always_ located inside of a "children" property (instead of being inside `items` for JSS, and `children` for GraphQL).
- Raw HTML tags are parsed and the appropriate data is abstracted out into an object (e.g. `src` and `alt` is pulled from `<img src="foo" alt="bar" />`).

To further illustrate the aformentioned points, here are some examples of input before and after data processing:

<br>

#### Sample GraphQL:
##### Before
```
[
    {
        id: '0FBC47145B4B44B48E8AD1B3CF809ACE',
        name: "Australia",
        fields: [
            {
                name: "Flag"
                value: "<image mediaid="{B17AB46D-F1C9-42A6-93C9-CBF53E1F6374}" />"
                rendered: "<img src="/-/media/Images/Project/Common/Country-Flags/Flags/flag_australia.ashx?h=32&amp;iar=0&amp;w=32&amp;hash=721225B8E10063F2A18D4E61B09A67A6" alt="" width="32" height="32" />"
                __typename: "ImageField"
                __proto__: Object
            },
        ]
    }
]
```

##### After
```
[
    {
        id: '0FBC47145B4B44B48E8AD1B3CF809ACE',
        name: 'Australia',
        fields: {
            Flag: {
                src: "/-/media/Images/Project/Common/Country-Flags/Flags/flag_australia.ashx?h=32&amp;iar=0&amp;w=32&amp;hash=721225B8E10063F2A18D4E61B09A67A6",
                width: 32,
                height: 32,
                alt: "",
            },
        },
    }
]
```

<br>

#### Sample JSS:
##### Before
```
{
    "id": "15538538-d279-4357-a819-37333e5bb293",
    "name": "SocialMedia",
    "fields": {
        "items": [{
            "id": "40b459f8-b8bf-4552-b611-98e2e175d5d3",
            "name": "Facebook",
            "fields": {
                "Url": {
                    "value": {
                        "href": "https://www.facebook.com/abc-corp/",
                        "url": "https://www.facebook.com/abc-corp/"
                    }
                },
                "Text": {
                    "value": "ABC Corp Facebook"
                }
            }
        }, {
            "id": "7e22ad97-6925-4703-aeee-471fad2e2770",
            "name": "Instagram",
            "fields": {
                "Url": {
                    "value": {
                        "href": "https://www.instagram.com/abc-corp/",
                        "url": "https://www.instagram.com/abc-corp/"
                    }
                },
                "Text": {
                    "value": "ABC Corp Instagram"
                }
            }
        }]
    }
}
```

##### After
```
{
    id: '15538538-d279-4357-a819-37333e5bb293',
    name: 'SocialMedia',
    fields: {
        children: [{
            id: '40b459f8-b8bf-4552-b611-98e2e175d5d3',
            name: 'Facebook',
            fields: {
                Url: {
                    href: 'https://www.facebook.com/abc-corp/',
                    url: 'https://www.facebook.com/abc-corp/',
                },
                Text: 'ABC Corp Facebook',
            },
        }, {
            id: '7e22ad97-6925-4703-aeee-471fad2e2770',
            name: 'Instagram',
            fields: {
                Url: {
                    href: 'https://www.instagram.com/abc-corp/',
                    url: 'https://www.instagram.com/abc-corp/',
                },
                Text: 'ABC Corp Instagram',
            },
        }],
    },
}
```

<br>

### Using the JSS Component Schematic
The schematic included in this package will both scaffold a new component, and register it with the JSS module. To use the schematic, add the following npm script to your `package.json` file (if it does not already exist):

`"scaffold": "ng generate @xcentium/jss-angular-kit:jss-component"`

... then run it using:

`npm run scaffold some-folder/some-component-name`

Note that the schematic makes a few assumptions about the structure of your project. Namely:

1) That adding `@import "global"` to your starting .scss file will work, aka you must have a global.scss file that can be imported.
2) That adding `<app-placeholder>` to your starting .html file will work, aka you must have an app-placeholder component.

<br>

### Working with the Custom Directives

There are a handful of custom directives included in this package to help improve the DX when working on an Angular JSS app. Each one contains instructions and examples at the top of the file.

<br>

## Contributing
Clone the repository locally and make changes as needed. If you need to add any new public-facing APIs, make sure to include them inside of the `public-api.ts` file.

<br>

## Testing Changes
Run `npm run build && npm run pack`. This will create a `.tgz` file in the `dist` folder - which you can then `npm install` into another project for testing. For example:

```
cd path/to/other/project

npm i path/to/tgz
```

<br>

## Publishing
Run the following:

```
git add . --all
git commit -m 'some message here'
npm version [semver]
git push
npm run publish
```

... where `[semver]` should be replaced with either `major`, `minor`, or `patch`. See [NPM - About Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning) for more information.
