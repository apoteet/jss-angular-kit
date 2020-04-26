# XC JSS Libraries
This project contains libraries to assist with front-end development for Sitecore JSS projects.

<br>

## Contributing
Navigate to the directory of the library you want to update (e.g. `projects/jss-angular-kit`) and make your changes there. If you need to add new public-facing APIs, make sure they are listed inside of the `public-api.ts` file.

<br>

## Testing
Within the library directory, run `npm run build && npm run pack`. This will create a `.tgz` file in the `dist/your-library-name` folder - which you can then `npm install` into another project for testing. For example:

```
cd path/to/other/project

npm i path/to/tgz
```

<br>

## Publishing
Within the library directory, run the following:

```
npm version [semver]
npm run build
```

... where `[semver]` should be replaced with either `major`, `minor`, or `patch`. See [NPM - About Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning) for more information.

Next, git commit and push up your changes:

```
git commit -m 'some message here'
git push
```

Finally, **navigate to the dist folder** (e.g. `dist/jss-angular-kit`) to publish the package:

```
npm publish
```
