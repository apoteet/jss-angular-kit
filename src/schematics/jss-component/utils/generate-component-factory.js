/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs');
const path = require('path');
const { pascalCase } = require('change-case');

/*
  COMPONENT FACTORY GENERATION
  Generates the /src/app/components/jss-components.module.ts file which maps Angular components
  to JSS components.

  The component factory module defines a mapping between a string component name and a Angular component instance.
  When the Sitecore Layout service returns a layout definition, it returns named components.
  This mapping is used to construct the component hierarchy for the layout.
*/

// tslint:disable:no-console

const componentFactoryPath = path.resolve('src/app/components/jss-components.module.ts');
const componentRootPath = 'src/app/components';

function importsSort(importStatementA, importStatementAB) {
    const startIndexA = importStatementA.indexOf('{') + 1;
    const endIndexA = importStatementA.indexOf('}');
    const componentNameA = importStatementA.slice(startIndexA, endIndexA).trim();

    const startIndexB = importStatementAB.indexOf('{') + 1;
    const endIndexB = importStatementAB.indexOf('}');
    const componentNameB = importStatementAB.slice(startIndexB, endIndexB).trim();

    return componentNameA < componentNameB ? -1 : 1;
}

function registrationsSort(regStatementA, regStatementB) {
    const startIndexA = regStatementA.indexOf('name:') + 5;
    const endIndexA = regStatementA.indexOf(',');
    const substrA = regStatementA.slice(startIndexA, endIndexA);
    const componentNameA = substrA.trim().replace(/'/g, '');

    const startIndexB = regStatementB.indexOf('name:') + 5;
    const endIndexB = regStatementB.indexOf(',');
    const substrB = regStatementB.slice(startIndexB, endIndexB);
    const componentNameB = substrB.trim().replace(/'/g, '');

    return componentNameA < componentNameB ? -1 : 1;
}

function declarationsSort(decStatementA, decStatementB) {
    const componentNameA = decStatementA.slice(0, -1);
    const componentNameB = decStatementB.slice(0, -1);

    return componentNameA < componentNameB ? -1 : 1;
}

function generateComponentFactory(newComponent) {
    // By convention, we expect to find Angular components
    // under /src/app/components/component-name/component-name.component.ts
    // If a component-name.module.ts file exists, we will treat it as lazy loaded.
    // If you'd like to use your own convention, encode it below.
    // NOTE: generating the component factory module is also totally optional,
    // and it can be maintained manually if preferred.

    const imports = [];
    const registrations = [];
    const lazyRegistrations = [];
    const declarations = [];

    fs.readdirSync(componentRootPath).forEach((componentFolder) => {
        const subfolderPath = path.join(componentRootPath, componentFolder);

        if (componentFolder.endsWith('.ts') || componentFolder === '.gitignore') return;

        fs.readdirSync(subfolderPath).forEach((subfolder) => {
            // ignore ts files in component root folder
            if (subfolder.endsWith('.ts') || subfolder === '.gitignore') return;

            const componentFilePath = path.join(subfolderPath, subfolder, `${ subfolder }.component.ts`);

            if (!fs.existsSync(componentFilePath)) {
                return;
            }
            
            const componentFileContents = fs.readFileSync(componentFilePath, 'utf8');

            // ASSUMPTION: your component should export a class directly that follows Angular conventions,
            // i.e. `export class FooComponent` - so we can detect the component's name for auto registration.
            const componentClassMatch = /export class (.+)Component/g.exec(componentFileContents);

            if (componentClassMatch === null) {
                console.debug(
                    `Component ${ componentFilePath } did not seem to export a component class. It will be skipped.`,
                );
                return;
            }

            const componentName = componentClassMatch[1];
            const importVarName = `${ componentName }Component`;

            // check for lazy loading needs
            const moduleFilePath = path.join(subfolderPath, `${ subfolder }.module.ts`);
            const isLazyLoaded = fs.existsSync(moduleFilePath);

            if (isLazyLoaded) {
                console.debug(`Registering JSS component (lazy) ${ componentName }`);
                lazyRegistrations.push(
                    `{ path: '${ componentName }', loadChildren: () => import('./${ componentFolder }/${ subfolder }/${ subfolder }.module').then(m => m.${ componentName }Module) },`,
                );
            } else {
                console.debug(`Registering JSS component ${ componentName }`);
                imports.push(`import { ${ importVarName } } from './${ componentFolder }/${ subfolder }/${ subfolder }.component';`);
                registrations.push(`{ name: '${ componentName }', type: ${ importVarName } },`);
                declarations.push(`${ importVarName },`);
            }
        });
    });

    const newComponentSubfolder = newComponent.path.slice(newComponent.path.lastIndexOf('/'));
    const newComponentVarName = pascalCase(newComponent.name);

    console.debug(`Registering JSS component ${ newComponentVarName }`);
    imports.push(`import { ${ newComponentVarName }Component } from '.${ newComponentSubfolder }/${ newComponent.name }/${ newComponent.name }.component';`);
    registrations.push(`{ name: '${ newComponentVarName }', type: ${ newComponentVarName }Component },`);
    declarations.push(`${ newComponentVarName }Component,`);

    imports.sort(importsSort);
    registrations.sort(registrationsSort);
    declarations.sort(declarationsSort);

    return `// Do not edit this file, it is auto-generated at build time!
// tslint:disable

import { NgModule } from '@angular/core';
import { JssModule } from '@sitecore-jss/sitecore-jss-angular';
import { AppComponentsModule } from './app-components.module';

${ imports.join('\n') }

@NgModule({
    imports: [
        AppComponentsModule,
        JssModule.withComponents([
            ${ registrations.join('\n            ') }
        ], [${ lazyRegistrations.join('\n            ') }]),
    ],
    exports: [
        JssModule,
    ],
    declarations: [
        ${ declarations.join('\n        ') }
    ],
})
export class JssComponentsModule { }
`;
}

function writeComponentFactory(options) {
    const newComponent = {
        name: options.name,
        path: options.path,
    };

    const componentFactory = generateComponentFactory(newComponent);

    console.log(`Writing component factory to ${ componentFactoryPath }`);

    fs.writeFileSync(componentFactoryPath, componentFactory, { encoding: 'utf8' });
}

module.exports = { writeComponentFactory }
