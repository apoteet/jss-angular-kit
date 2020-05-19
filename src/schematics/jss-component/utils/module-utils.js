const { SchematicsException } = require('@angular-devkit/schematics');
const { createSourceFile, ScriptTarget } = require('typescript');
const { strings } = require('@angular-devkit/core');
const { buildRelativePath } = require('@schematics/angular/utility/find-module');
const { addDeclarationToModule, addExportToModule } = require('@schematics/angular/utility/ast-utils');
const { InsertChange } = require('@schematics/angular/utility/change');

const { classify, dasherize } = strings;

function createAddToModuleContext(host, options) {
    const result = {
        source: null, // source of the module file
        relativePath: '', // the relative path (from module file to the component file)
        classifiedName: '', // the name of the component class
    };

    if (!options.module) {
        throw new SchematicsException('Module not found.');
    }

    const text = host.read(options.module);

    if (text === null) {
        throw new SchematicsException(`The file "${ options.module }" does not exist.`);
    }

    const sourceText = text.toString('utf-8');
    const componentPath = `${ options.path }/${ dasherize(options.name) }/${ dasherize(options.name) }.component`;

    result.source = createSourceFile(options.module, sourceText, ScriptTarget.Latest, true);
    result.relativePath = buildRelativePath(options.module, componentPath);
    result.classifiedName = classify(`${ options.name }Component`);

    return result;
}

function addDeclaration(host, options) {
    const context = createAddToModuleContext(host, options);
    const modulePath = options.module || '';

    const declarationChanges = addDeclarationToModule(
        context.source,
        modulePath,
        context.classifiedName,
        context.relativePath,
    );

    const declarationRecorder = host.beginUpdate(modulePath);

    for (const change of declarationChanges) {
        if (change instanceof InsertChange) {
            declarationRecorder.insertLeft(change.pos, change.toAdd);
        }
    }

    host.commitUpdate(declarationRecorder);
}

function addExport(host, options) {
    const context = createAddToModuleContext(host, options);
    const modulePath = options.module || '';

    const exportChanges = addExportToModule(
        context.source,
        modulePath,
        context.classifiedName,
        context.relativePath,
    );

    const exportRecorder = host.beginUpdate(modulePath);

    for (const change of exportChanges) {
        if (change instanceof InsertChange) {
            exportRecorder.insertLeft(change.pos, change.toAdd);
        }
    }

    host.commitUpdate(exportRecorder);
}

function addDeclarationToNgModule(options, exports) {
    return (host) => {
        addDeclaration(host, options);

        if (exports) {
            addExport(host, options);
        }

        return host;
    };
}

module.exports = { addDeclarationToNgModule };
