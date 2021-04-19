"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
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
const cli_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/cli");
const AdmZip = require("adm-zip");
const os = require("os");
const path = require("path");
const shell = require("shelljs");
const vscode = require("vscode");
const channels_1 = require("../channels");
const messages_1 = require("../messages");
const notifications_1 = require("../notifications");
const statuses_1 = require("../statuses");
const telemetry_1 = require("../telemetry");
const util_1 = require("../util");
const directoryDiffer_1 = require("./directoryDiffer");
class ConflictDetector {
    constructor(differ) {
        this.differ = differ || new directoryDiffer_1.CommonDirDirectoryDiffer();
    }
    static getInstance() {
        if (!ConflictDetector.instance) {
            ConflictDetector.instance = new ConflictDetector(new directoryDiffer_1.CommonDirDirectoryDiffer());
        }
        return ConflictDetector.instance;
    }
    getCachePath(username) {
        return path.join(os.tmpdir(), '.sfdx', 'tools', 'conflicts', username);
    }
    buildRetrieveOrgSourceCommand(usernameOrAlias, targetPath, manifestPath) {
        return new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('conflict_detect_retrieve_org_source'))
            .withArg('force:mdapi:retrieve')
            .withFlag('--retrievetargetdir', targetPath)
            .withFlag('--unpackaged', manifestPath)
            .withFlag('--targetusername', usernameOrAlias)
            .withLogName('conflict_detect_retrieve_org_source')
            .build();
    }
    buildMetadataApiConvertOrgSourceCommand(rootDir, outputDir) {
        return new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('conflict_detect_convert_org_source'))
            .withArg('force:mdapi:convert')
            .withFlag('--rootdir', rootDir)
            .withFlag('--outputdir', outputDir)
            .withLogName('conflict_detect_convert_org_source')
            .build();
    }
    clearCache(usernameOrAlias, throwErrorOnFailure = false) {
        const cachePath = this.getCachePath(usernameOrAlias);
        this.clearDirectory(cachePath, throwErrorOnFailure);
        return cachePath;
    }
    checkForConflicts(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = process.hrtime();
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            const cancellationToken = cancellationTokenSource.token;
            let results;
            try {
                results = yield this.checkForConflictsInternal(util_1.getRootWorkspacePath(), data, cancellationTokenSource, cancellationToken);
            }
            catch (error) {
                this.reportError('conflict_detect_error', error);
                return Promise.reject(error);
            }
            telemetry_1.telemetryService.sendCommandEvent('conflict_detect', startTime, undefined, {
                conflicts: results.different.size,
                orgFiles: results.scannedRemote,
                localFiles: results.scannedLocal
            });
            return results;
        });
    }
    checkForConflictsInternal(projectPath, data, cancellationTokenSource, cancellationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tempMetadataPath = this.clearCache(data.usernameOrAlias, true);
            // 1: prep the shadow directory
            const manifestPath = path.join(tempMetadataPath, 'package.xml');
            try {
                shell.mkdir('-p', tempMetadataPath);
                shell.cp(data.manifest, manifestPath);
            }
            catch (error) {
                this.reportError('error_creating_packagexml', error);
                return Promise.reject();
            }
            // 2: retrieve unmanaged org source to the shadow directory
            yield this.executeCommand(this.buildRetrieveOrgSourceCommand(data.usernameOrAlias, tempMetadataPath, manifestPath), projectPath, cancellationTokenSource, cancellationToken);
            // 3: unzip retrieved source
            const unpackagedZipFile = path.join(tempMetadataPath, 'unpackaged.zip');
            try {
                const zip = new AdmZip(unpackagedZipFile);
                zip.extractAllTo(tempMetadataPath, true);
            }
            catch (error) {
                this.reportError('error_extracting_org_source', error);
                return Promise.reject();
            }
            // 4: convert org source to decomposed (source) format
            const unconvertedSourcePath = path.join(tempMetadataPath, 'unpackaged');
            const convertedSourcePath = path.join(tempMetadataPath, 'converted');
            yield this.executeCommand(this.buildMetadataApiConvertOrgSourceCommand(unconvertedSourcePath, convertedSourcePath), projectPath, cancellationTokenSource, cancellationToken);
            // 5: diff project directory (local) and retrieved directory (remote)
            // Assume there are consistent subdirs from each root i.e. 'main/default'
            const localSourcePath = path.join(projectPath, data.packageDir);
            const diffs = this.differ.diff(localSourcePath, convertedSourcePath);
            return diffs;
        });
    }
    executeCommand(command, projectPath, cancellationTokenSource, cancellationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = process.hrtime();
            const execution = new cli_1.CliCommandExecutor(command, { cwd: projectPath, env: { SFDX_JSON_TO_STDOUT: 'true' } }, true).execute(cancellationToken);
            const result = new cli_1.CommandOutput().getCmdResult(execution);
            this.attachExecution(execution, cancellationTokenSource, cancellationToken);
            execution.processExitSubject.subscribe(() => {
                telemetry_1.telemetryService.sendCommandEvent(execution.command.logName, startTime);
            });
            return result;
        });
    }
    attachExecution(execution, cancellationTokenSource, cancellationToken) {
        channels_1.channelService.streamCommandOutput(execution);
        channels_1.channelService.showChannelOutput();
        notifications_1.notificationService.reportCommandExecutionStatus(execution, cancellationToken);
        notifications_1.ProgressNotification.show(execution, cancellationTokenSource);
        statuses_1.taskViewService.addCommandExecution(execution, cancellationTokenSource);
    }
    clearDirectory(dirToRemove, throwErrorOnFailure) {
        try {
            shell.rm('-rf', dirToRemove);
        }
        catch (error) {
            this.reportError('error_cleanup_temp_files', error);
            if (throwErrorOnFailure) {
                throw error;
            }
        }
    }
    reportError(messageKey, error) {
        console.error(error);
        const errorMsg = messages_1.nls.localize(messageKey, error.toString());
        channels_1.channelService.appendLine(errorMsg);
        notifications_1.notificationService.showErrorMessage(errorMsg);
        telemetry_1.telemetryService.sendException('ConflictDetectionException', errorMsg);
    }
}
exports.ConflictDetector = ConflictDetector;
//# sourceMappingURL=conflictDetectionService.js.map