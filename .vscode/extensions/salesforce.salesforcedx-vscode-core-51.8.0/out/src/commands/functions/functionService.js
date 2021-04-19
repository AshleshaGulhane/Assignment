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
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const util_1 = require("../../util");
class FunctionService {
    constructor() {
        this.startedExecutions = new Map();
    }
    static get instance() {
        if (FunctionService._instance === undefined) {
            FunctionService._instance = new FunctionService();
        }
        return FunctionService._instance;
    }
    /**
     * Locate the directory that has function.toml.
     * If sourceFsPath is the function folder that has function.toml, or a subdirectory
     * or file within that folder, this method returns the function folder by recursively looking up.
     * Otherwise, it returns undefined.
     * @param sourceFsPath path to start function from
     */
    static getFunctionDir(sourceFsPath) {
        let current = fs.lstatSync(sourceFsPath).isDirectory()
            ? sourceFsPath
            : path.dirname(sourceFsPath);
        const { root } = path.parse(sourceFsPath);
        const rootWorkspacePath = util_1.getRootWorkspacePath();
        while (current !== rootWorkspacePath && current !== root) {
            const tomlPath = path.join(current, 'function.toml');
            if (fs.existsSync(tomlPath)) {
                return current;
            }
            current = path.dirname(current);
        }
        return undefined;
    }
    /**
     * Register started functions, in order to terminate the container.
     * Returns a disposable to unregister in case an error happens when starting function
     *
     * @returns {Disposable} disposable to unregister
     */
    registerStartedFunction(functionExecution) {
        this.startedExecutions.set(functionExecution.rootDir, functionExecution);
        return {
            dispose: () => {
                this.startedExecutions.delete(functionExecution.rootDir);
            }
        };
    }
    isFunctionStarted() {
        return this.startedExecutions.size > 0;
    }
    /**
     * Stop all started function containers
     */
    stopFunction() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([...this.startedExecutions.values()].map(functionExecution => {
                return functionExecution.terminate();
            }));
            this.startedExecutions.clear();
        });
    }
    getStartedFunction(rootDir) {
        return this.startedExecutions.get(rootDir);
    }
    /**
     * Start a debug session that attaches to the debug port of a locally running function.
     * Return if VS Code already has a debug session attached.
     * @param rootDir functions root directory
     */
    debugFunction(rootDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const functionExecution = this.getStartedFunction(rootDir);
            if (functionExecution) {
                const { debugPort } = functionExecution;
                const debugConfiguration = {
                    type: 'node',
                    request: 'attach',
                    name: 'Debug Invoke',
                    resolveSourceMapLocations: ['**', '!**/node_modules/**'],
                    console: 'integratedTerminal',
                    internalConsoleOptions: 'openOnSessionStart',
                    localRoot: rootDir,
                    remoteRoot: '/workspace',
                    port: debugPort
                };
                if (!functionExecution.debugSession) {
                    yield vscode.debug.startDebugging(util_1.getRootWorkspace(), debugConfiguration);
                }
            }
        });
    }
    /**
     * Detach the debugger
     * @param rootDir functions root directory
     */
    stopDebuggingFunction(rootDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const functionExecution = this.getStartedFunction(rootDir);
            if (functionExecution) {
                const { debugSession } = functionExecution;
                yield (debugSession === null || debugSession === void 0 ? void 0 : debugSession.customRequest('disconnect'));
                // When we update VS Code engine to 1.49 we should use stopDebugging
                // https://code.visualstudio.com/updates/v1_49
                // await vscode.debug.stopDebugging(debugSession);
            }
        });
    }
    /**
     * Register listeners for debug session start/stop events and keep track of active debug sessions
     * @param context extension context
     */
    handleDidStartTerminateDebugSessions(context) {
        const handleDidStartDebugSession = vscode.debug.onDidStartDebugSession(session => {
            const { configuration } = session;
            const { localRoot } = configuration;
            const functionExecution = this.getStartedFunction(localRoot);
            if (functionExecution) {
                functionExecution.debugSession = session;
            }
        });
        const handleDidTerminateDebugSession = vscode.debug.onDidTerminateDebugSession(session => {
            const { configuration } = session;
            const { localRoot } = configuration;
            const functionExecution = this.getStartedFunction(localRoot);
            if (functionExecution) {
                functionExecution.debugSession = undefined;
            }
        });
        context.subscriptions.push(handleDidStartDebugSession, handleDidTerminateDebugSession);
    }
}
exports.FunctionService = FunctionService;
//# sourceMappingURL=functionService.js.map