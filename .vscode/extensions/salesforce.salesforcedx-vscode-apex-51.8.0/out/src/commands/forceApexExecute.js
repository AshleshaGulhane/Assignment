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
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const apex_node_1 = require("@salesforce/apex-node");
const src_1 = require("@salesforce/salesforcedx-utils-vscode/out/src");
const cli_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/cli");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const channels_1 = require("../channels");
const context_1 = require("../context");
const messages_1 = require("../messages");
const settings_1 = require("../settings");
class CreateApexTempFile {
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            if (src_1.hasRootWorkspace()) {
                const fileName = path.join(src_1.getRootWorkspacePath(), '.sfdx', 'tools', 'tempApex.input');
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return { type: 'CANCEL' };
                }
                const { document, selection } = editor;
                const contents = document.getText(selection.isEmpty ? undefined : selection);
                fs.writeFileSync(fileName, contents);
                return { type: 'CONTINUE', data: { fileName } };
            }
            return { type: 'CANCEL' };
        });
    }
}
exports.CreateApexTempFile = CreateApexTempFile;
class ForceApexExecuteExecutor extends src_1.SfdxCommandletExecutor {
    constructor() {
        super(channels_1.OUTPUT_CHANNEL);
    }
    build(data) {
        return new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_apex_execute_document_text'))
            .withArg('force:apex:execute')
            .withFlag('--apexcodefile', data.fileName)
            .withLogName('force_apex_execute')
            .build();
    }
}
exports.ForceApexExecuteExecutor = ForceApexExecuteExecutor;
class AnonApexGatherer {
    gather() {
        return __awaiter(this, void 0, void 0, function* () {
            if (src_1.hasRootWorkspace()) {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return { type: 'CANCEL' };
                }
                const document = editor.document;
                if (!editor.selection.isEmpty || document.isUntitled) {
                    return {
                        type: 'CONTINUE',
                        data: {
                            apexCode: !editor.selection.isEmpty
                                ? document.getText(editor.selection)
                                : document.getText()
                        }
                    };
                }
                return { type: 'CONTINUE', data: { fileName: document.uri.fsPath } };
            }
            return { type: 'CANCEL' };
        });
    }
}
exports.AnonApexGatherer = AnonApexGatherer;
class ApexLibraryExecuteExecutor extends src_1.LibraryCommandletExecutor {
    constructor() {
        super(messages_1.nls.localize('apex_execute_text'), 'force_apex_execute_library', channels_1.OUTPUT_CHANNEL);
    }
    run(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield context_1.workspaceContext.getConnection();
            const executeService = new apex_node_1.ExecuteService(connection);
            const { apexCode, fileName: apexFilePath } = response.data;
            const result = yield executeService.executeAnonymous({
                apexFilePath,
                apexCode
            });
            this.outputResult(result);
            const editor = vscode.window.activeTextEditor;
            const document = editor.document;
            const filePath = apexFilePath !== null && apexFilePath !== void 0 ? apexFilePath : document.uri.fsPath;
            this.handleDiagnostics(result, filePath);
            return result.success;
        });
    }
    outputResult(response) {
        let outputText = '';
        if (response.success) {
            outputText += `${messages_1.nls.localize('apex_execute_compile_success')}\n`;
            outputText += `${messages_1.nls.localize('apex_execute_runtime_success')}\n`;
            outputText += `\n${response.logs}`;
        }
        else {
            const diagnostic = response.diagnostic[0];
            if (!response.compiled) {
                outputText += `Error: Line: ${diagnostic.lineNumber}, Column: ${diagnostic.columnNumber}\n`;
                outputText += `Error: ${diagnostic.compileProblem}\n`;
            }
            else {
                outputText += `${messages_1.nls.localize('apex_execute_compile_success')}\n`;
                outputText += `Error: ${diagnostic.exceptionMessage}\n`;
                outputText += `Error: ${diagnostic.exceptionStackTrace}\n`;
                outputText += `\n${response.logs}`;
            }
        }
        channels_1.channelService.appendLine(outputText);
    }
    handleDiagnostics(response, filePath) {
        ApexLibraryExecuteExecutor.diagnostics.clear();
        if (response.diagnostic) {
            const { compileProblem, exceptionMessage, lineNumber, columnNumber } = response.diagnostic[0];
            let message;
            if (compileProblem && compileProblem !== '') {
                message = compileProblem;
            }
            else if (exceptionMessage && exceptionMessage !== '') {
                message = exceptionMessage;
            }
            else {
                message = messages_1.nls.localize('apex_execute_unexpected_error');
            }
            const vscDiagnostic = {
                message,
                severity: vscode.DiagnosticSeverity.Error,
                source: filePath,
                range: this.getZeroBasedRange(Number(lineNumber) || 1, Number(columnNumber) || 1)
            };
            ApexLibraryExecuteExecutor.diagnostics.set(vscode.Uri.file(filePath), [
                vscDiagnostic
            ]);
        }
    }
    getZeroBasedRange(line, column) {
        const pos = new vscode.Position(line > 0 ? line - 1 : 0, column > 0 ? column - 1 : 0);
        return new vscode.Range(pos, pos);
    }
}
exports.ApexLibraryExecuteExecutor = ApexLibraryExecuteExecutor;
ApexLibraryExecuteExecutor.diagnostics = vscode.languages.createDiagnosticCollection('apex-errors');
function forceApexExecute() {
    return __awaiter(this, void 0, void 0, function* () {
        let parametersGatherer;
        let executor;
        if (settings_1.useApexLibrary()) {
            parametersGatherer = new AnonApexGatherer();
            executor = new ApexLibraryExecuteExecutor();
        }
        else {
            parametersGatherer = new CreateApexTempFile();
            executor = new ForceApexExecuteExecutor();
        }
        const commandlet = new src_1.SfdxCommandlet(new src_1.SfdxWorkspaceChecker(), parametersGatherer, executor);
        yield commandlet.run();
    });
}
exports.forceApexExecute = forceApexExecute;
//# sourceMappingURL=forceApexExecute.js.map