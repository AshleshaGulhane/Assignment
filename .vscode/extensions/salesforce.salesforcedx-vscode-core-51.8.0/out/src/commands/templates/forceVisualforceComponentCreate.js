"use strict";
/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
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
const templates_1 = require("@salesforce/templates");
const messages_1 = require("../../messages");
const util_1 = require("../util");
const postconditionCheckers_1 = require("../util/postconditionCheckers");
const libraryBaseTemplateCommand_1 = require("./libraryBaseTemplateCommand");
const metadataTypeConstants_1 = require("./metadataTypeConstants");
class LibraryForceVisualForceComponentCreateExecutor extends libraryBaseTemplateCommand_1.LibraryBaseTemplateCommand {
    constructor() {
        super(...arguments);
        this.executionName = messages_1.nls.localize('force_visualforce_component_create_text');
        this.telemetryName = 'force_visualforce_component_create';
        this.metadataTypeName = metadataTypeConstants_1.VISUALFORCE_COMPONENT_TYPE;
        this.templateType = templates_1.TemplateType.VisualforceComponent;
    }
    getOutputFileName(data) {
        return data.fileName;
    }
    constructTemplateOptions(data) {
        const templateOptions = {
            outputdir: data.outputdir,
            componentname: data.fileName,
            label: data.fileName,
            template: 'DefaultVFComponent'
        };
        return templateOptions;
    }
}
exports.LibraryForceVisualForceComponentCreateExecutor = LibraryForceVisualForceComponentCreateExecutor;
const fileNameGatherer = new util_1.SelectFileName();
const outputDirGatherer = new util_1.SelectOutputDir(metadataTypeConstants_1.VISUALFORCE_COMPONENT_DIRECTORY);
const metadataTypeGatherer = new util_1.MetadataTypeGatherer(metadataTypeConstants_1.VISUALFORCE_COMPONENT_TYPE);
function forceVisualforceComponentCreate() {
    return __awaiter(this, void 0, void 0, function* () {
        const createTemplateExecutor = new LibraryForceVisualForceComponentCreateExecutor();
        const commandlet = new util_1.SfdxCommandlet(new util_1.SfdxWorkspaceChecker(), new util_1.CompositeParametersGatherer(metadataTypeGatherer, fileNameGatherer, outputDirGatherer), createTemplateExecutor, new postconditionCheckers_1.OverwriteComponentPrompt());
        yield commandlet.run();
    });
}
exports.forceVisualforceComponentCreate = forceVisualforceComponentCreate;
//# sourceMappingURL=forceVisualforceComponentCreate.js.map