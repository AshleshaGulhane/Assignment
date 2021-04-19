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
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const cli_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/cli");
const source_deploy_retrieve_1 = require("@salesforce/source-deploy-retrieve");
const vscode = require("vscode");
const channels_1 = require("../channels");
const messages_1 = require("../messages");
const notifications_1 = require("../notifications");
const settings_1 = require("../settings");
const telemetry_1 = require("../telemetry");
const baseDeployCommand_1 = require("./baseDeployCommand");
const baseDeployRetrieve_1 = require("./baseDeployRetrieve");
const forceSourceRetrieveSourcePath_1 = require("./forceSourceRetrieveSourcePath");
const util_1 = require("./util");
class ForceSourceDeploySourcePathExecutor extends baseDeployCommand_1.BaseDeployExecutor {
    build(sourcePath) {
        const commandBuilder = new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_source_deploy_text'))
            .withArg('force:source:deploy')
            .withLogName('force_source_deploy_with_sourcepath')
            .withFlag('--sourcepath', sourcePath)
            .withJson();
        return commandBuilder.build();
    }
    getDeployType() {
        return baseDeployCommand_1.DeployType.Deploy;
    }
}
exports.ForceSourceDeploySourcePathExecutor = ForceSourceDeploySourcePathExecutor;
class LibraryDeploySourcePathExecutor extends baseDeployRetrieve_1.DeployExecutor {
    constructor() {
        super(messages_1.nls.localize('force_source_deploy_text'), 'force_source_deploy_with_sourcepath_beta');
    }
    getComponents(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = response.data;
            const components = new source_deploy_retrieve_1.ComponentSet();
            if (typeof paths === 'string') {
                components.resolveSourceComponents(paths);
            }
            else {
                for (const filepath of paths) {
                    components.resolveSourceComponents(filepath);
                }
            }
            return components;
        });
    }
}
exports.LibraryDeploySourcePathExecutor = LibraryDeploySourcePathExecutor;
class MultipleSourcePathsGatherer {
    constructor(uris) {
        this.uris = uris;
    }
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            const sourcePaths = this.uris.map(uri => uri.fsPath).join(',');
            return {
                type: 'CONTINUE',
                data: sourcePaths
            };
        });
    }
}
exports.MultipleSourcePathsGatherer = MultipleSourcePathsGatherer;
class LibraryPathsGatherer {
    constructor(uris) {
        this.uris = uris;
    }
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            const sourcePaths = this.uris.map(uri => uri.fsPath);
            return {
                type: 'CONTINUE',
                data: sourcePaths
            };
        });
    }
}
exports.LibraryPathsGatherer = LibraryPathsGatherer;
function forceSourceDeploySourcePath(sourceUri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sourceUri) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId !== 'forcesourcemanifest') {
                sourceUri = editor.document.uri;
            }
            else {
                const errorMessage = messages_1.nls.localize('force_source_deploy_select_file_or_directory');
                telemetry_1.telemetryService.sendException('force_source_deploy_with_sourcepath', errorMessage);
                notifications_1.notificationService.showErrorMessage(errorMessage);
                channels_1.channelService.appendLine(errorMessage);
                channels_1.channelService.showChannelOutput();
                return;
            }
        }
        const commandlet = new util_1.SfdxCommandlet(new util_1.SfdxWorkspaceChecker(), new util_1.FilePathGatherer(sourceUri), settings_1.sfdxCoreSettings.getBetaDeployRetrieve()
            ? new LibraryDeploySourcePathExecutor()
            : new ForceSourceDeploySourcePathExecutor(), new forceSourceRetrieveSourcePath_1.SourcePathChecker());
        yield commandlet.run();
    });
}
exports.forceSourceDeploySourcePath = forceSourceDeploySourcePath;
function forceSourceDeployMultipleSourcePaths(uris) {
    return __awaiter(this, void 0, void 0, function* () {
        const useBeta = settings_1.sfdxCoreSettings.getBetaDeployRetrieve();
        const commandlet = new util_1.SfdxCommandlet(new util_1.SfdxWorkspaceChecker(), useBeta
            ? new LibraryPathsGatherer(uris)
            : new MultipleSourcePathsGatherer(uris), useBeta
            ? new LibraryDeploySourcePathExecutor()
            : new ForceSourceDeploySourcePathExecutor());
        yield commandlet.run();
    });
}
exports.forceSourceDeployMultipleSourcePaths = forceSourceDeployMultipleSourcePaths;
//# sourceMappingURL=forceSourceDeploySourcePath.js.map