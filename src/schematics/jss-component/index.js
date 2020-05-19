/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const { strings } = require('@angular-devkit/core');
const { getWorkspace } = require('@schematics/angular/utility/config');
const { parseName } = require('@schematics/angular/utility/parse-name');
const { validateHtmlSelector, validateName } = require('@schematics/angular/utility/validation');
const chalk = require('chalk');
const {
    apply,
    branchAndMerge,
    chain,
    filter,
    mergeWith,
    move,
    noop,
    SchematicsException,
    template,
    url,
} = require('@angular-devkit/schematics');

const { writeComponentFactory } = require('./utils/generate-component-factory');
// const { addDeclarationToNgModule } = require('./utils/module-utils');

function buildSelector(options, projectPrefix) {
    let selector = strings.dasherize(options.name);

    if (options.prefix) {
        selector = `${ options.prefix }-${ selector }`;
    } else if (options.prefix === undefined && projectPrefix) {
        selector = `${ projectPrefix }-${ selector }`;
    }

    return selector;
}

function ruleFactory(options) {
    return (host) => {
        options.module = options.module || '/src/app/components/app-components.module.ts';

        const workspace = getWorkspace(host);

        if (!options.project) {
            throw new SchematicsException('Option (project) is required.');
        }

        const project = workspace.projects[options.project];

        if (options.path === undefined) {
            options.path = `/${ project.root }/src/app`;
        }

        options.name = `components/${ options.name }`;

        const parsedPath = parseName(options.path, options.name);

        options.name = parsedPath.name;
        options.path = parsedPath.path;
        options.selector = options.selector || buildSelector(options, project.prefix);
        validateName(options.name);
        validateHtmlSelector(options.selector);

        const sources = [];

        if (!options.noManifest) {
            const manifestTemplateSource = apply(url('./manifest-files'), [
                template({ ...strings, ...options }),
            ]);

            sources.push(mergeWith(manifestTemplateSource));
        }

        const templateSource = apply(url('./component-files'), [
            options.spec ? noop() : filter((path) => !path.endsWith('.spec.ts')),
            options.inlineStyle ? filter((path) => !path.endsWith('.__styleext__')) : noop(),
            options.inlineTemplate ? filter((path) => !path.endsWith('.html')) : noop(),
            options.lazyload ? noop() : filter((path) => !path.endsWith('.module.ts')),
            template({ ...strings, 'if-flat': (s) => (options.flat ? '' : s), ...options }),
            move(parsedPath.path),
        ]);

        sources.push(mergeWith(templateSource));

        console.log();
        console.log(chalk.green(`Component ${ options.name } is scaffolding.`));
        console.log('Scaffolding complete!');
        console.log();

        // sources.push(addDeclarationToNgModule(options, options.export));
        writeComponentFactory(options);

        return branchAndMerge(chain(sources));
    };
}

exports.default = ruleFactory;
