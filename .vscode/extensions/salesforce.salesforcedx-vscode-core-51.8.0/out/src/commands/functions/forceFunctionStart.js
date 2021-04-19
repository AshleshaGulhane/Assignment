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
const cli_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/cli");
const Subject_1 = require("rxjs/Subject");
const vscode = require("vscode");
const channels_1 = require("../../channels");
const messages_1 = require("../../messages");
const notifications_1 = require("../../notifications");
const statuses_1 = require("../../statuses");
const telemetry_1 = require("../../telemetry");
const util_1 = require("../../util");
const util_2 = require("../util");
const vscode_1 = require("vscode");
const functionService_1 = require("./functionService");
const constants_1 = require("./types/constants");
const forceFunctionStartErrorInfo = {
    force_function_start_plugin_not_installed: {
        cliMessage: 'is not a sfdx command',
        cliExitCode: 127,
        errorNotificationMessage: messages_1.nls.localize('force_function_start_warning_plugin_not_installed')
    },
    force_function_start_docker_plugin_not_installed_or_started: {
        cliMessage: 'Cannot connect to the Docker daemon',
        cliExitCode: 1,
        errorNotificationMessage: messages_1.nls.localize('force_function_start_warning_docker_not_installed_or_not_started')
    }
};
class ForceFunctionStartExecutor extends util_2.SfdxCommandletExecutor {
    build(functionDirPath) {
        this.executionCwd = functionDirPath;
        return new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_function_start_text'))
            .withArg('evergreen:function:start')
            .withArg('--verbose')
            .withLogName('force_function_start')
            .build();
    }
    execute(response) {
        const startTime = process.hrtime();
        const cancellationTokenSource = new vscode.CancellationTokenSource();
        const cancellationToken = cancellationTokenSource.token;
        const sourceFsPath = response.data;
        const functionDirPath = functionService_1.FunctionService.getFunctionDir(sourceFsPath);
        if (!functionDirPath) {
            const warningMessage = messages_1.nls.localize('force_function_start_warning_no_toml');
            notifications_1.notificationService.showWarningMessage(warningMessage);
            telemetry_1.telemetryService.sendException('force_function_start_no_toml', warningMessage);
            return;
        }
        const execution = new cli_1.CliCommandExecutor(this.build(functionDirPath), {
            cwd: this.executionCwd,
            env: { SFDX_JSON_TO_STDOUT: 'true' }
        }).execute(cancellationToken);
        const executionName = execution.command.toString();
        cancellationToken.onCancellationRequested(() => __awaiter(this, void 0, void 0, function* () {
            yield execution.killExecution('SIGTERM');
            this.logMetric('force_function_start_cancelled', startTime);
        }));
        util_1.OrgAuthInfo.getDefaultUsernameOrAlias(false)
            .then(defaultUsernameorAlias => {
            if (!defaultUsernameorAlias) {
                const message = messages_1.nls.localize('force_function_start_no_org_auth');
                channels_1.channelService.appendLine(message);
                channels_1.channelService.showChannelOutput();
                notifications_1.notificationService.showInformationMessage(message);
            }
        })
            .catch(error => {
            // ignore, getDefaultUsernameOrAlias catches the error and logs telemetry
        });
        const registeredStartedFunctionDisposable = functionService_1.FunctionService.instance.registerStartedFunction({
            rootDir: functionDirPath,
            port: constants_1.FUNCTION_DEFAULT_PORT,
            debugPort: constants_1.FUNCTION_DEFAULT_DEBUG_PORT,
            terminate: () => {
                return execution.killExecution('SIGTERM');
            }
        });
        channels_1.channelService.streamCommandOutput(execution);
        channels_1.channelService.showChannelOutput();
        const progress = new Subject_1.Subject();
        notifications_1.ProgressNotification.show(execution, cancellationTokenSource, vscode.ProgressLocation.Notification, progress.asObservable());
        const task = statuses_1.taskViewService.addCommandExecution(execution, cancellationTokenSource);
        execution.stdoutSubject.subscribe(data => {
            if (data.toString().includes('Ready to process signals')) {
                progress.complete();
                statuses_1.taskViewService.removeTask(task);
                notifications_1.notificationService
                    .showSuccessfulExecution(executionName)
                    .catch(() => { });
                this.logMetric(execution.command.logName, startTime);
            }
        });
        // Adding error messages here during command execution
        const errorMessages = new Set();
        execution.stderrSubject.subscribe(data => {
            Object.keys(forceFunctionStartErrorInfo).forEach(errorType => {
                const { cliMessage } = forceFunctionStartErrorInfo[errorType];
                if (data.toString().includes(cliMessage)) {
                    errorMessages.add(cliMessage);
                }
            });
        });
        execution.processExitSubject.subscribe((exitCode) => __awaiter(this, void 0, void 0, function* () {
            if (typeof exitCode === 'number' && exitCode !== 0) {
                let unexpectedError = true;
                Object.keys(forceFunctionStartErrorInfo).forEach(errorType => {
                    const { cliMessage, cliExitCode, errorNotificationMessage } = forceFunctionStartErrorInfo[errorType];
                    // Matches error message and exit code
                    if (exitCode === cliExitCode && errorMessages.has(cliMessage)) {
                        unexpectedError = false;
                        telemetry_1.telemetryService.sendException(errorType, errorNotificationMessage);
                        notifications_1.notificationService.showErrorMessage(errorNotificationMessage);
                        channels_1.channelService.appendLine(`Error: ${errorNotificationMessage}`);
                        channels_1.channelService.showChannelOutput();
                    }
                });
                if (unexpectedError) {
                    const errorNotificationMessage = messages_1.nls.localize('force_function_start_unexpected_error', exitCode);
                    telemetry_1.telemetryService.sendException('force_function_start_unexpected_error', errorNotificationMessage);
                    notifications_1.notificationService.showErrorMessage(errorNotificationMessage);
                    channels_1.channelService.appendLine(`Error: ${errorNotificationMessage}`);
                    channels_1.channelService.showChannelOutput();
                }
                notifications_1.notificationService.showErrorMessage(messages_1.nls.localize('notification_unsuccessful_execution_text', messages_1.nls.localize('force_function_start_text')));
            }
            progress.complete();
            registeredStartedFunctionDisposable.dispose();
        }));
        notifications_1.notificationService.reportCommandExecutionStatus(execution, cancellationToken);
    }
}
exports.ForceFunctionStartExecutor = ForceFunctionStartExecutor;
/**
 * Executes sfdx evergreen:function:start --verbose
 * @param sourceUri
 */
function forceFunctionStart(sourceUri) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!sourceUri) {
            // Try to start function from current active editor, if running SFDX: start function from command palette
            sourceUri = (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri;
        }
        if (!sourceUri) {
            const warningMessage = messages_1.nls.localize('force_function_start_warning_not_in_function_folder');
            notifications_1.notificationService.showWarningMessage(warningMessage);
            telemetry_1.telemetryService.sendException('force_function_start_not_in_function_folder', warningMessage);
            return;
        }
        const commandlet = new util_2.SfdxCommandlet(new util_2.SfdxWorkspaceChecker(), new util_2.FilePathGatherer(sourceUri), new ForceFunctionStartExecutor());
        yield commandlet.run();
    });
}
exports.forceFunctionStart = forceFunctionStart;
//# sourceMappingURL=forceFunctionStart.js.map