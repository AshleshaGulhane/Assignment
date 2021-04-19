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
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("./constants");
const messages_1 = require("./messages");
const requirements = require("./requirements");
const telemetry_1 = require("./telemetry");
const UBER_JAR_NAME = 'apex-jorje-lsp.jar';
const JDWP_DEBUG_PORT = 2739;
const APEX_LANGUAGE_SERVER_MAIN = 'apex.jorje.lsp.ApexLanguageServerLauncher';
const DEBUG = typeof v8debug === 'object' || startedInDebugMode();
function createServer(context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            deleteDbIfExists();
            const requirementsData = yield requirements.resolveRequirements();
            const uberJar = path.resolve(context.extensionPath, 'out', UBER_JAR_NAME);
            const javaExecutable = path.resolve(`${requirementsData.java_home}/bin/java`);
            const jvmMaxHeap = requirementsData.java_memory;
            const enableSemanticErrors = vscode.workspace
                .getConfiguration()
                .get('salesforcedx-vscode-apex.enable-semantic-errors', false);
            const enableCompletionStatistics = vscode.workspace
                .getConfiguration()
                .get('salesforcedx-vscode-apex.advanced.enable-completion-statistics', false);
            const args = [
                '-cp',
                uberJar,
                '-Ddebug.internal.errors=true',
                `-Ddebug.semantic.errors=${enableSemanticErrors}`,
                `-Ddebug.completion.statistics=${enableCompletionStatistics}`
            ];
            if (jvmMaxHeap) {
                args.push(`-Xmx${jvmMaxHeap}M`);
            }
            if (DEBUG) {
                args.push('-Dtrace.protocol=false', `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${JDWP_DEBUG_PORT},quiet=y`);
            }
            args.push(APEX_LANGUAGE_SERVER_MAIN);
            return {
                options: {
                    env: process.env,
                    stdio: 'pipe'
                },
                command: javaExecutable,
                args
            };
        }
        catch (err) {
            vscode.window.showErrorMessage(err);
            telemetry_1.telemetryService.sendException(constants_1.LSP_ERR, err.error);
            throw err;
        }
    });
}
function deleteDbIfExists() {
    if (vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders[0]) {
        const dbPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.sfdx', 'tools', 'apex.db');
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
        }
    }
}
function startedInDebugMode() {
    const args = process.execArgv;
    if (args) {
        return args.some((arg) => /^--debug=?/.test(arg) ||
            /^--debug-brk=?/.test(arg) ||
            /^--inspect=?/.test(arg) ||
            /^--inspect-brk=?/.test(arg));
    }
    return false;
}
// See https://github.com/Microsoft/vscode-languageserver-node/issues/105
function code2ProtocolConverter(value) {
    if (/^win32/.test(process.platform)) {
        // The *first* : is also being encoded which is not the standard for URI on Windows
        // Here we transform it back to the standard way
        return value.toString().replace('%3A', ':');
    }
    else {
        return value.toString();
    }
}
exports.code2ProtocolConverter = code2ProtocolConverter;
function protocol2CodeConverter(value) {
    return vscode.Uri.parse(value);
}
function createLanguageServer(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientOptions = {
            // Register the server for Apex documents
            documentSelector: [{ language: 'apex', scheme: 'file' }],
            synchronize: {
                configurationSection: 'apex',
                fileEvents: [
                    vscode.workspace.createFileSystemWatcher('**/*.cls'),
                    vscode.workspace.createFileSystemWatcher('**/*.trigger'),
                    vscode.workspace.createFileSystemWatcher('**/sfdx-project.json') // SFDX workspace configuration file
                ]
            },
            uriConverters: {
                code2Protocol: code2ProtocolConverter,
                protocol2Code: protocol2CodeConverter
            }
        };
        const server = yield createServer(context);
        const client = new vscode_languageclient_1.LanguageClient('apex', messages_1.nls.localize('client_name'), server, clientOptions);
        client.onTelemetry(data => telemetry_1.telemetryService.sendEventData('apexLSPLog', data.properties, data.measures));
        return client;
    });
}
exports.createLanguageServer = createLanguageServer;
//# sourceMappingURL=languageServer.js.map