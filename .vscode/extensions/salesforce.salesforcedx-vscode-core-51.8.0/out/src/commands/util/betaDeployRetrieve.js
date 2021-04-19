"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const src_1 = require("@salesforce/salesforcedx-utils-vscode/out/src");
const sfdxProject_1 = require("../../sfdxProject");
/**
 * Reformats errors thrown by beta deploy/retrieve logic.
 *
 * @param e Error to reformat
 * @returns A newly formatted error
 */
function formatException(e) {
    return __awaiter(this, void 0, void 0, function* () {
        const formattedException = new Error('Unknown Exception');
        formattedException.name = e.name;
        if (e.name === 'TypeInferenceError') {
            const projectPath = src_1.getRelativeProjectPath(e.message.slice(0, e.message.lastIndexOf(':')), yield sfdxProject_1.SfdxPackageDirectories.getPackageDirectoryPaths());
            formattedException.message = `${projectPath}: Could not infer metadata type`;
        }
        return formattedException;
    });
}
exports.formatException = formatException;
function createComponentCount(components) {
    const quantities = {};
    for (const component of components) {
        const { name: typeName } = component.type;
        const typeCount = quantities[typeName];
        quantities[typeName] = typeCount ? typeCount + 1 : 1;
    }
    return Object.keys(quantities).map(type => ({
        type,
        quantity: quantities[type]
    }));
}
exports.createComponentCount = createComponentCount;
//# sourceMappingURL=betaDeployRetrieve.js.map