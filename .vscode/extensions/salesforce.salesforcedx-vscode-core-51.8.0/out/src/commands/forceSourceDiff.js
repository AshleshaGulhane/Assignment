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
const cli_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/cli");
const vscode = require("vscode");
const channels_1 = require("../channels");
const messages_1 = require("../messages");
const notifications_1 = require("../notifications");
const statuses_1 = require("../statuses");
const telemetry_1 = require("../telemetry");
const util_1 = require("../util");
const util_2 = require("./util");
class ForceSourceDiffExecutor extends util_2.SfdxCommandletExecutor {
    build(filePath) {
        const commandBuilder = new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_source_diff_text'))
            .withArg('force:source:diff')
            .withLogName('force_source_diff')
            .withFlag('--sourcepath', filePath)
            .withJson();
        return commandBuilder.build();
    }
    execute(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = process.hrtime();
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            const cancellationToken = cancellationTokenSource.token;
            const execution = new cli_1.CliCommandExecutor(this.build(response.data), {
                cwd: util_1.getRootWorkspacePath(),
                env: { SFDX_JSON_TO_STDOUT: 'true' }
            }).execute(cancellationToken);
            channels_1.channelService.streamCommandStartStop(execution);
            let stdOut = '';
            execution.stdoutSubject.subscribe(realData => {
                stdOut += realData.toString();
            });
            execution.processExitSubject.subscribe((exitCode) => __awaiter(this, void 0, void 0, function* () {
                this.logMetric(execution.command.logName, startTime);
                yield handleDiffResponse(exitCode, stdOut);
            }));
            notifications_1.notificationService.reportCommandExecutionStatus(execution, cancellationToken);
            notifications_1.ProgressNotification.show(execution, cancellationTokenSource);
            statuses_1.taskViewService.addCommandExecution(execution, cancellationTokenSource);
        });
    }
}
exports.ForceSourceDiffExecutor = ForceSourceDiffExecutor;
function handleDiffResponse(exitCode, stdOut) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (exitCode === 127) {
                throw new Error(messages_1.nls.localize('force_source_diff_command_not_found'));
            }
            const diffParser = new cli_1.DiffResultParser(stdOut);
            const diffParserSuccess = diffParser.getSuccessResponse();
            const diffParserError = diffParser.getErrorResponse();
            if (diffParserSuccess) {
                const diffResult = diffParserSuccess.result;
                const remote = vscode.Uri.file(diffResult.remote);
                const local = vscode.Uri.file(diffResult.local);
                const filename = diffResult.fileName;
                let defaultUsernameorAlias;
                if (util_1.hasRootWorkspace()) {
                    defaultUsernameorAlias = yield util_1.OrgAuthInfo.getDefaultUsernameOrAlias(false);
                }
                vscode.commands.executeCommand('vscode.diff', remote, local, messages_1.nls.localize('force_source_diff_title', defaultUsernameorAlias, filename, filename));
            }
            else if (diffParserError) {
                channels_1.channelService.appendLine(diffParserError.message);
                channels_1.channelService.showChannelOutput();
            }
        }
        catch (e) {
            notifications_1.notificationService.showErrorMessage(e.message);
            channels_1.channelService.appendLine(e.message);
            channels_1.channelService.showChannelOutput();
            telemetry_1.telemetryService.sendException(e.name, e.message);
        }
    });
}
exports.handleDiffResponse = handleDiffResponse;
const workspaceChecker = new util_2.SfdxWorkspaceChecker();
function forceSourceDiff(sourceUri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sourceUri) {
            const editor = vscode.window.activeTextEditor;
            if (editor &&
                (editor.document.languageId === 'apex' ||
                    editor.document.languageId === 'visualforce' ||
                    editor.document.fileName.includes('aura') ||
                    editor.document.fileName.includes('lwc') ||
                    editor.document.fileName.includes('permissionset-meta.xml') ||
                    editor.document.fileName.includes('layout-meta.xml'))) {
                sourceUri = editor.document.uri;
            }
            else {
                const errorMessage = messages_1.nls.localize('force_source_diff_unsupported_type');
                telemetry_1.telemetryService.sendException('unsupported_type_on_diff', errorMessage);
                notifications_1.notificationService.showErrorMessage(errorMessage);
                channels_1.channelService.appendLine(errorMessage);
                channels_1.channelService.showChannelOutput();
                return;
            }
        }
        const commandlet = new util_2.SfdxCommandlet(workspaceChecker, new util_2.FilePathGatherer(sourceUri), new ForceSourceDiffExecutor());
        yield commandlet.run();
    });
}
exports.forceSourceDiff = forceSourceDiff;
//# sourceMappingURL=forceSourceDiff.js.map