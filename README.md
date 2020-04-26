# XC JSS Libraries

This project contains libraries to assist with Sitecore JSS-related front-end development. There is currently only one library in this rep - `jss-angular-kit`.

## Contributing

Navigate to `projects/jss-angular-kit` and make your changes there. If you need to add new public-facing APIs, make sure they are listed inside of the `projects/jss-angular-kit/src/public-api.ts` file.

## Testing
Within the `projects/jss-angular-kit` directory, run `npm run build && npm run pack`. This will create a `.tgz` file in the `dist/jss-angular-kit` folder - which you can then `npm install` into another project for testing. For example:

```
cd path/to/other/project

npm i path/to/tgz/in/dist/folder
```

## Publishing

Within the `projects/jss-angular-kit` directory, run `npm run build`. Now you can git commit your changes and publish to the npm registry:

```
git add . --all
git commit -m "some message here"
npm version [semver]
npm publish
git push
```

... where `[semver]` should be replaced with either `major`, `minor`, or `patch`. See [NPM - About Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning) for more information.
