"use strict";
/*
 * Copyright (c) 2017, salesforce.com, inc.
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
const helpers_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/helpers");
const path = require("path");
const vscode = require("vscode");
const codecoverage_1 = require("./codecoverage");
const commands_1 = require("./commands");
const constants_1 = require("./constants");
const context_1 = require("./context");
const languageClientUtils_1 = require("./languageClientUtils");
const languageServer = require("./languageServer");
const messages_1 = require("./messages");
const telemetry_1 = require("./telemetry");
const testOutlineProvider_1 = require("./views/testOutlineProvider");
const testRunner_1 = require("./views/testRunner");
let languageClient;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionHRStart = process.hrtime();
        const testOutlineProvider = new testOutlineProvider_1.ApexTestOutlineProvider(null);
        if (vscode.workspace && vscode.workspace.workspaceFolders) {
            const apexDirPath = helpers_1.getTestResultsFolder(vscode.workspace.workspaceFolders[0].uri.fsPath, 'apex');
            const testResultOutput = path.join(apexDirPath, '*.json');
            const testResultFileWatcher = vscode.workspace.createFileSystemWatcher(testResultOutput);
            testResultFileWatcher.onDidCreate(uri => testOutlineProvider.onResultFileCreate(apexDirPath, uri.fsPath));
            context.subscriptions.push(testResultFileWatcher);
        }
        else {
            throw new Error(messages_1.nls.localize('cannot_determine_workspace'));
        }
        // Workspace Context
        yield context_1.workspaceContext.initialize(context);
        // Telemetry
        const extensionPackage = require(context.asAbsolutePath('./package.json'));
        yield telemetry_1.telemetryService.initializeService(context, constants_1.APEX_EXTENSION_NAME, extensionPackage.aiKey, extensionPackage.version);
        // Initialize Apex language server
        try {
            const langClientHRStart = process.hrtime();
            languageClient = yield languageServer.createLanguageServer(context);
            languageClientUtils_1.languageClientUtils.setClientInstance(languageClient);
            const handle = languageClient.start();
            languageClientUtils_1.languageClientUtils.setStatus(languageClientUtils_1.ClientStatus.Indexing, '');
            context.subscriptions.push(handle);
            languageClient
                .onReady()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                if (languageClient) {
                    languageClient.onNotification('indexer/done', () => __awaiter(this, void 0, void 0, function* () {
                        yield testOutlineProvider.refresh();
                    }));
                }
                // TODO: This currently keeps existing behavior in which we set the language
                // server to ready before it finishes indexing. We'll evaluate this in the future.
                languageClientUtils_1.languageClientUtils.setStatus(languageClientUtils_1.ClientStatus.Ready, '');
                const startTime = telemetry_1.telemetryService.getEndHRTime(langClientHRStart);
                telemetry_1.telemetryService.sendEventData('apexLSPStartup', undefined, {
                    activationTime: startTime
                });
            }))
                .catch(err => {
                // Handled by clients
                telemetry_1.telemetryService.sendException(constants_1.LSP_ERR, err.message);
                languageClientUtils_1.languageClientUtils.setStatus(languageClientUtils_1.ClientStatus.Error, messages_1.nls.localize('apex_language_server_failed_activate'));
            });
        }
        catch (e) {
            console.error('Apex language server failed to initialize');
            languageClientUtils_1.languageClientUtils.setStatus(languageClientUtils_1.ClientStatus.Error, e);
        }
        // Javadoc support
        languageClientUtils_1.enableJavaDocSymbols();
        // Commands
        const commands = registerCommands(context);
        context.subscriptions.push(commands);
        context.subscriptions.push(yield registerTestView(testOutlineProvider));
        const exportedApi = {
            getLineBreakpointInfo: languageClientUtils_1.getLineBreakpointInfo,
            getExceptionBreakpointInfo: languageClientUtils_1.getExceptionBreakpointInfo,
            getApexTests: languageClientUtils_1.getApexTests,
            languageClientUtils: languageClientUtils_1.languageClientUtils
        };
        telemetry_1.telemetryService.sendExtensionActivationEvent(extensionHRStart);
        return exportedApi;
    });
}
exports.activate = activate;
function registerCommands(extensionContext) {
    // Colorize code coverage
    const statusBarToggle = new codecoverage_1.StatusBarToggle();
    const colorizer = new codecoverage_1.CodeCoverage(statusBarToggle);
    const forceApexToggleColorizerCmd = vscode.commands.registerCommand('sfdx.force.apex.toggle.colorizer', () => colorizer.toggleCoverage());
    // Customer-facing commands
    const forceApexTestClassRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.apex.test.class.run.delegate', commands_1.forceApexTestClassRunCodeActionDelegate);
    const forceApexTestLastClassRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.last.class.run', commands_1.forceApexTestClassRunCodeAction);
    const forceApexTestClassRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.class.run', commands_1.forceApexTestClassRunCodeAction);
    const forceApexTestMethodRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.apex.test.method.run.delegate', commands_1.forceApexTestMethodRunCodeActionDelegate);
    const forceApexDebugClassRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.apex.debug.class.run.delegate', commands_1.forceApexDebugClassRunCodeActionDelegate);
    const forceApexDebugMethodRunDelegateCmd = vscode.commands.registerCommand('sfdx.force.apex.debug.method.run.delegate', commands_1.forceApexDebugMethodRunCodeActionDelegate);
    const forceApexLogGetCmd = vscode.commands.registerCommand('sfdx.force.apex.log.get', commands_1.forceApexLogGet);
    const forceApexTestLastMethodRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.last.method.run', commands_1.forceApexTestMethodRunCodeAction);
    const forceApexTestMethodRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.method.run', commands_1.forceApexTestMethodRunCodeAction);
    const forceApexTestRunCmd = vscode.commands.registerCommand('sfdx.force.apex.test.run', commands_1.forceApexTestRun);
    const forceApexExecuteDocumentCmd = vscode.commands.registerCommand('sfdx.force.apex.execute.document', commands_1.forceApexExecute, false);
    const forceApexExecuteSelectionCmd = vscode.commands.registerCommand('sfdx.force.apex.execute.selection', commands_1.forceApexExecute, true);
    return vscode.Disposable.from(forceApexDebugClassRunDelegateCmd, forceApexDebugMethodRunDelegateCmd, forceApexExecuteDocumentCmd, forceApexExecuteSelectionCmd, forceApexLogGetCmd, forceApexTestClassRunCmd, forceApexTestClassRunDelegateCmd, forceApexTestLastClassRunCmd, forceApexTestLastMethodRunCmd, forceApexTestMethodRunCmd, forceApexTestMethodRunDelegateCmd, forceApexTestRunCmd, forceApexToggleColorizerCmd);
}
function registerTestView(testOutlineProvider) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create TestRunner
        const testRunner = new testRunner_1.ApexTestRunner(testOutlineProvider);
        // Test View
        const testViewItems = new Array();
        const testProvider = vscode.window.registerTreeDataProvider('sfdx.force.test.view', testOutlineProvider);
        testViewItems.push(testProvider);
        // Run Test Button on Test View command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.run', () => testRunner.runAllApexTests()));
        // Show Error Message command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.showError', test => testRunner.showErrorMessage(test)));
        // Show Definition command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.goToDefinition', test => testRunner.showErrorMessage(test)));
        // Run Class Tests command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.runClassTests', test => testRunner.runApexTests([test.name], testRunner_1.TestRunType.Class)));
        // Run Single Test command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.runSingleTest', test => testRunner.runApexTests([test.name], testRunner_1.TestRunType.Method)));
        // Refresh Test View command
        testViewItems.push(vscode.commands.registerCommand('sfdx.force.test.view.refresh', () => {
            if (languageClientUtils_1.languageClientUtils.getStatus().isReady()) {
                return testOutlineProvider.refresh();
            }
        }));
        return vscode.Disposable.from(...testViewItems);
    });
}
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        telemetry_1.telemetryService.sendExtensionDeactivationEvent();
    });
}
exports.deactivate = deactivate;
//# sourceMappingURL=index.js.map