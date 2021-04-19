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
const sfdxProject_1 = require("../sfdxProject");
const telemetry_1 = require("../telemetry");
const baseDeployRetrieve_1 = require("./baseDeployRetrieve");
const util_1 = require("./util");
class ForceSourceRetrieveSourcePathExecutor extends util_1.SfdxCommandletExecutor {
    build(sourcePath) {
        return new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_source_retrieve_text'))
            .withArg('force:source:retrieve')
            .withFlag('--sourcepath', sourcePath)
            .withLogName('force_source_retrieve_with_sourcepath')
            .build();
    }
}
exports.ForceSourceRetrieveSourcePathExecutor = ForceSourceRetrieveSourcePathExecutor;
class LibraryRetrieveSourcePathExecutor extends baseDeployRetrieve_1.RetrieveExecutor {
    constructor() {
        super(messages_1.nls.localize('force_source_retrieve_text'), 'force_source_retrieve_with_sourcepath_beta');
    }
    getComponents(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return source_deploy_retrieve_1.ComponentSet.fromSource(response.data);
        });
    }
}
exports.LibraryRetrieveSourcePathExecutor = LibraryRetrieveSourcePathExecutor;
class SourcePathChecker {
    check(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (inputs.type === 'CONTINUE') {
                const sourcePath = inputs.data;
                try {
                    const isInSfdxPackageDirectory = yield sfdxProject_1.SfdxPackageDirectories.isInPackageDirectory(sourcePath);
                    if (isInSfdxPackageDirectory) {
                        return inputs;
                    }
                }
                catch (error) {
                    telemetry_1.telemetryService.sendException('force_source_retrieve_with_sourcepath', `Error while parsing package directories. ${error.message}`);
                }
                const errorMessage = messages_1.nls.localize('error_source_path_not_in_package_directory_text');
                telemetry_1.telemetryService.sendException('force_source_retrieve_with_sourcepath', errorMessage);
                notifications_1.notificationService.showErrorMessage(errorMessage);
                channels_1.channelService.appendLine(errorMessage);
                channels_1.channelService.showChannelOutput();
            }
            return { type: 'CANCEL' };
        });
    }
}
exports.SourcePathChecker = SourcePathChecker;
function forceSourceRetrieveSourcePath(explorerPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!explorerPath) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId !== 'forcesourcemanifest') {
                explorerPath = editor.document.uri;
            }
            else {
                const errorMessage = messages_1.nls.localize('force_source_retrieve_select_file_or_directory');
                telemetry_1.telemetryService.sendException('force_source_retrieve_with_sourcepath', errorMessage);
                notifications_1.notificationService.showErrorMessage(errorMessage);
                channels_1.channelService.appendLine(errorMessage);
                channels_1.channelService.showChannelOutput();
                return;
            }
        }
        const commandlet = new util_1.SfdxCommandlet(new util_1.SfdxWorkspaceChecker(), new util_1.FilePathGatherer(explorerPath), settings_1.sfdxCoreSettings.getBetaDeployRetrieve()
            ? new LibraryRetrieveSourcePathExecutor()
            : new ForceSourceRetrieveSourcePathExecutor(), new SourcePathChecker());
        yield commandlet.run();
    });
}
exports.forceSourceRetrieveSourcePath = forceSourceRetrieveSourcePath;
//# sourceMappingURL=forceSourceRetrieveSourcePath.js.map