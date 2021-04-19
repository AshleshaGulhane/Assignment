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
const path_1 = require("path");
const vscode = require("vscode");
const channels_1 = require("../channels");
const postconditionCheckers_1 = require("../commands/util/postconditionCheckers");
const messages_1 = require("../messages");
const notifications_1 = require("../notifications");
const settings_1 = require("../settings");
const sfdxProject_1 = require("../sfdxProject");
const telemetry_1 = require("../telemetry");
const util_1 = require("../util");
const baseDeployRetrieve_1 = require("./baseDeployRetrieve");
const util_2 = require("./util");
class ForceSourceRetrieveManifestExecutor extends util_2.SfdxCommandletExecutor {
    build(manifestPath) {
        return new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_source_retrieve_text'))
            .withArg('force:source:retrieve')
            .withFlag('--manifest', manifestPath)
            .withLogName('force_source_retrieve_with_manifest')
            .build();
    }
}
exports.ForceSourceRetrieveManifestExecutor = ForceSourceRetrieveManifestExecutor;
class LibrarySourceRetrieveManifestExecutor extends baseDeployRetrieve_1.RetrieveExecutor {
    constructor() {
        super(messages_1.nls.localize('force_source_retrieve_text'), 'force_source_retrieve_with_manifest_beta');
    }
    getComponents(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const packageDirs = yield sfdxProject_1.SfdxPackageDirectories.getPackageDirectoryPaths();
            return source_deploy_retrieve_1.ComponentSet.fromManifestFile(response.data, {
                resolve: packageDirs.map(relativeDir => path_1.join(util_1.getRootWorkspacePath(), relativeDir)),
                literalWildcard: true
            });
        });
    }
}
exports.LibrarySourceRetrieveManifestExecutor = LibrarySourceRetrieveManifestExecutor;
function forceSourceRetrieveManifest(explorerPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!explorerPath) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'forcesourcemanifest') {
                explorerPath = editor.document.uri;
            }
            else {
                const errorMessage = messages_1.nls.localize('force_source_retrieve_select_manifest');
                telemetry_1.telemetryService.sendException('force_source_retrieve_with_manifest', errorMessage);
                notifications_1.notificationService.showErrorMessage(errorMessage);
                channels_1.channelService.appendLine(errorMessage);
                channels_1.channelService.showChannelOutput();
                return;
            }
        }
        const messages = {
            warningMessageKey: 'conflict_detect_conflicts_during_retrieve',
            commandHint: input => {
                return new cli_1.SfdxCommandBuilder()
                    .withArg('force:source:retrieve')
                    .withFlag('--manifest', input)
                    .build()
                    .toString();
            }
        };
        const commandlet = new util_2.SfdxCommandlet(new util_2.SfdxWorkspaceChecker(), new util_2.FilePathGatherer(explorerPath), settings_1.sfdxCoreSettings.getBetaDeployRetrieve()
            ? new LibrarySourceRetrieveManifestExecutor()
            : new ForceSourceRetrieveManifestExecutor(), new postconditionCheckers_1.ConflictDetectionChecker(messages));
        yield commandlet.run();
    });
}
exports.forceSourceRetrieveManifest = forceSourceRetrieveManifest;
//# sourceMappingURL=forceSourceRetrieveManifest.js.map