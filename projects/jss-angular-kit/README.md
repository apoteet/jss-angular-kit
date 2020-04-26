# JSS Angular Kit
A collection of helper functions and TypeScript interfaces to assist with Angular projects that use Sitecore JSS.

<br>

## Installation
1) Run `npm i @xcentium/jss-angular-kit`.
2) Inside of your root app component (which is named `app.component.ts` by default), initialize the Sitecore Data Service like so:

```
import { SitecoreDataService } from '@xcentium/jss-angular-kit';
import { JssGraphQLService } from '../path/to/jss-graphql.service';
import * as jssConfig from '../path/to/scjssconfig.json';

export class MyAppComponent {
    constructor(sds: SitecoreDataService) {
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

### Get JSS Data
You can use the `get` method to fetch Sitecore data via JSS. The data is [processed](#processed-data) before being returned, in order to make it more consistent, predictable, and easier to parse.

**Examples**
```
// simply return the rendering itself
this.sds.get(this.rendering)

// return a specific Sitecore item
this.sds.get(this.rendering, 'SocialMedia')

// return a specific Sitecore field
this.sds.get(this.rendering, 'SocialMedia', 'Facebook')
```

<br>

### Get GraphQL Data
You can use the `fetch` method to fetch Sitecore data via GraphQL. Similar to the previous method, the data is also [processed](#processed-data) before being returned.

**Example**
```
// fetch a Sitecore item by GUID
this.sds.fetch('{83E04F4B-3A98-402F-840B-AEFA415FD147}')
```

<br>

### Using Types
The OOTB Sitecore JSS type definitions are a bit unwieldy to work with as you'll find yourself constantly coercing types to prevent the TypeScript compiler from yelling at you. We've redefined their types with some slight variations to make it easier to work with JSS data.

To use our type definitions, simply import `types` from the library. Aliasing it to `ts` is optional but helps keeps the code less verbose.

**Example**
```
import { SitecoreDataService, types as ts } from '@xcentium/jss-angular-kit';

constructor(private sds: SitecoreDataService) {}

export class MyFooterComponent implements OnInit {
    @Input() rendering: ts.JssComponentRendering;

    socialMedia: ts.DataItem;

    ngOnInit(): void {
        this.socialMedia = this.sds.get(this.rendering, 'SocialMedia');
    }
}
```

<br>

### Processed Data
The data returned by `get` and `fetch` is processed before being returned in order to **(a)** address inconsistencies between the data structures returned by the JSS endpoint and GraphQL, and **(b)** to make it easier to grab the data properties you need.

More specifically:

- JSS field values are no longer nested inside of a "value" property (e.g. `Image.src` instead of `Image.value.src`).
- Child items are now _always_ located inside of a "children" property (instead of being inside `items` for JSS, and `children` for GraphQL).
- Raw HTML tags are parsed and the appropriate data is abstracted out into an object (e.g. `src` and `alt` is pulled from `<img src="foo" alt="bar" />`).

To further illustrate the aformentioned points, here are some examples of input before and after data processing:

#### Sample GraphQL
**Before**
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

**After**
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

#### Sample JSS
**Before**
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

**After**
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
