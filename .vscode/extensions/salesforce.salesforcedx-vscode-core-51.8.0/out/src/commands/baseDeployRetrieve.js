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
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const src_1 = require("@salesforce/salesforcedx-utils-vscode/out/src");
const output_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/output");
const source_deploy_retrieve_1 = require("@salesforce/source-deploy-retrieve");
const types_1 = require("@salesforce/source-deploy-retrieve/lib/src/client/types");
const path_1 = require("path");
const _1 = require(".");
const channels_1 = require("../channels");
const constants_1 = require("../constants");
const context_1 = require("../context");
const diagnostics_1 = require("../diagnostics");
const messages_1 = require("../messages");
const settings_1 = require("../settings");
const sfdxProject_1 = require("../sfdxProject");
const util_1 = require("./util");
class DeployRetrieveExecutor extends src_1.LibraryCommandletExecutor {
    constructor(executionName, logName) {
        super(executionName, logName, channels_1.OUTPUT_CHANNEL);
        this.cancellable = true;
    }
    run(response, progress, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            try {
                const components = yield this.getComponents(response);
                this.telemetry.addProperty(constants_1.TELEMETRY_METADATA_COUNT, JSON.stringify(util_1.createComponentCount(components)));
                result = yield this.doOperation(components, token);
                const status = this.getStatus(result);
                return (status === types_1.RequestStatus.Succeeded ||
                    status === types_1.RequestStatus.SucceededPartial);
            }
            catch (e) {
                throw yield util_1.formatException(e);
            }
            finally {
                yield this.postOperation(result);
            }
        });
    }
    getStatus(result) {
        return result && 'response' in result
            ? result.response.status
            : result === null || result === void 0 ? void 0 : result.status;
    }
    setupCancellation(operation, token) {
        if (token && operation) {
            token.onCancellationRequested(() => {
                operation.cancel();
            });
        }
    }
}
exports.DeployRetrieveExecutor = DeployRetrieveExecutor;
class DeployExecutor extends DeployRetrieveExecutor {
    doOperation(components, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const operation = components.deploy({
                usernameOrConnection: yield context_1.workspaceContext.getConnection()
            });
            this.setupCancellation(operation, token);
            return operation.start();
        });
    }
    postOperation(result) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (result) {
                    _1.BaseDeployExecutor.errorCollection.clear();
                    const relativePackageDirs = yield sfdxProject_1.SfdxPackageDirectories.getPackageDirectoryPaths();
                    const output = this.createOutput(result, relativePackageDirs);
                    channels_1.channelService.appendLine(output);
                    const success = result.response.status === types_1.RequestStatus.Succeeded;
                    if (!success) {
                        diagnostics_1.handleDeployDiagnostics(result, _1.BaseDeployExecutor.errorCollection);
                    }
                }
            }
            finally {
                yield settings_1.DeployQueue.get().unlock();
            }
        });
    }
    createOutput(result, relativePackageDirs) {
        const table = new output_1.Table();
        const rowsWithRelativePaths = result.getFileResponses().map(response => {
            response.filePath = src_1.getRelativeProjectPath(response.filePath, relativePackageDirs);
            return response;
        });
        let output;
        if (result.response.status === types_1.RequestStatus.Succeeded) {
            output = table.createTable(rowsWithRelativePaths, [
                { key: 'state', label: messages_1.nls.localize('table_header_state') },
                { key: 'fullName', label: messages_1.nls.localize('table_header_full_name') },
                { key: 'type', label: messages_1.nls.localize('table_header_type') },
                {
                    key: 'filePath',
                    label: messages_1.nls.localize('table_header_project_path')
                }
            ], messages_1.nls.localize(`table_title_deployed_source`));
        }
        else {
            output = table.createTable(rowsWithRelativePaths.filter(row => row.error), [
                {
                    key: 'filePath',
                    label: messages_1.nls.localize('table_header_project_path')
                },
                { key: 'error', label: messages_1.nls.localize('table_header_errors') }
            ], messages_1.nls.localize(`table_title_deploy_errors`));
        }
        return output;
    }
}
exports.DeployExecutor = DeployExecutor;
class RetrieveExecutor extends DeployRetrieveExecutor {
    doOperation(components, token) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield context_1.workspaceContext.getConnection();
            // utilize the tooling API for single component retrieves for improved performance
            const oneComponent = components.getSourceComponents().first();
            if (components.size === 1 && this.isToolingSupported(oneComponent)) {
                const projectNamespace = (yield sfdxProject_1.SfdxProjectConfig.getValue('namespace'));
                const tooling = new source_deploy_retrieve_1.ToolingApi(connection, new source_deploy_retrieve_1.MetadataResolver());
                return tooling.retrieve({
                    components,
                    namespace: projectNamespace
                });
            }
            const defaultOutput = path_1.join(src_1.getRootWorkspacePath(), (_a = (yield sfdxProject_1.SfdxPackageDirectories.getDefaultPackageDir())) !== null && _a !== void 0 ? _a : '');
            const operation = components.retrieve({
                usernameOrConnection: connection,
                output: defaultOutput,
                merge: true
            });
            this.setupCancellation(operation, token);
            return operation.start();
        });
    }
    postOperation(result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (result) {
                const relativePackageDirs = yield sfdxProject_1.SfdxPackageDirectories.getPackageDirectoryPaths();
                let output;
                if (result instanceof source_deploy_retrieve_1.RetrieveResult) {
                    output = this.createOutput(result, relativePackageDirs);
                }
                else {
                    output = this.createToolingOutput(result, relativePackageDirs);
                }
                channels_1.channelService.appendLine(output);
            }
        });
    }
    createOutput(result, relativePackageDirs) {
        const successes = [];
        const failures = [];
        for (const response of result.getFileResponses()) {
            const asRow = response;
            response.filePath = src_1.getRelativeProjectPath(response.filePath, relativePackageDirs);
            if (response.state !== types_1.ComponentStatus.Failed) {
                successes.push(asRow);
            }
            else {
                failures.push(asRow);
            }
        }
        return this.createOutputTable(successes, failures);
    }
    /**
     * This exists because the Tooling API result currently doesn't conform to the
     * same interface as the Metadata API deploy and retrieve result objects.
     */
    createToolingOutput(retrieveResult, relativePackageDirs) {
        const successes = [];
        const failures = [];
        for (const success of retrieveResult.successes) {
            const { component, properties } = success;
            if (component) {
                const { fullName, type, xml } = component;
                for (const fsPath of component.walkContent()) {
                    successes.push({
                        fullName,
                        type: type.name,
                        filePath: src_1.getRelativeProjectPath(fsPath, relativePackageDirs)
                    });
                }
                if (xml) {
                    successes.push({
                        fullName,
                        type: type.name,
                        filePath: src_1.getRelativeProjectPath(xml, relativePackageDirs)
                    });
                }
            }
        }
        for (const failure of retrieveResult.failures) {
            const { component, message } = failure;
            if (component) {
                failures.push({
                    fullName: component.fullName,
                    type: component.type.name,
                    error: message
                });
            }
        }
        return this.createOutputTable(successes, failures);
    }
    createOutputTable(successes, failures) {
        const table = new output_1.Table();
        let output = '';
        if (successes.length > 0) {
            output += table.createTable(successes, [
                { key: 'fullName', label: messages_1.nls.localize('table_header_full_name') },
                { key: 'type', label: messages_1.nls.localize('table_header_type') },
                {
                    key: 'filePath',
                    label: messages_1.nls.localize('table_header_project_path')
                }
            ], messages_1.nls.localize(`lib_retrieve_result_title`));
        }
        if (failures.length > 0) {
            if (successes.length > 0) {
                output += '\n';
            }
            output += table.createTable(failures, [
                { key: 'fullName', label: messages_1.nls.localize('table_header_full_name') },
                { key: 'type', label: messages_1.nls.localize('table_header_type') },
                { key: 'error', label: messages_1.nls.localize('table_header_message') }
            ], messages_1.nls.localize('lib_retrieve_message_title'));
        }
        return output;
    }
    isToolingSupported(component) {
        if (component) {
            const { types } = source_deploy_retrieve_1.registryData;
            const permittedTypeNames = [
                types.auradefinitionbundle.name,
                types.lightningcomponentbundle.name,
                types.apexclass.name,
                types.apexcomponent.name,
                types.apexpage.name,
                types.apextrigger.name
            ];
            return (component.fullName !== '*' &&
                permittedTypeNames.includes(component.type.name));
        }
        return false;
    }
}
exports.RetrieveExecutor = RetrieveExecutor;
//# sourceMappingURL=baseDeployRetrieve.js.map