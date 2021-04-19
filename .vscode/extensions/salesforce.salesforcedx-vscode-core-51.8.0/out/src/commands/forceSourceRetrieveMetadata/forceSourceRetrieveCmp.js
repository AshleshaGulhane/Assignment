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
const cli_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/cli");
const source_deploy_retrieve_1 = require("@salesforce/source-deploy-retrieve");
const path = require("path");
const vscode = require("vscode");
const channels_1 = require("../../channels");
const messages_1 = require("../../messages");
const settings_1 = require("../../settings");
const sfdxProject_1 = require("../../sfdxProject");
const telemetry_1 = require("../../telemetry");
const util_1 = require("../../util");
const baseDeployRetrieve_1 = require("../baseDeployRetrieve");
const util_2 = require("../util");
const parameterGatherers_1 = require("../util/parameterGatherers");
const postconditionCheckers_1 = require("../util/postconditionCheckers");
class ForceSourceRetrieveExecutor extends util_2.SfdxCommandletExecutor {
    constructor(describer, openAfterRetrieve = false) {
        super();
        this.openAfterRetrieve = false;
        this.describer = describer;
        this.openAfterRetrieve = openAfterRetrieve;
    }
    build(data) {
        return new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_source_retrieve_text'))
            .withLogName('force_source_retrieve')
            .withArg('force:source:retrieve')
            .withJson()
            .withArg('-m')
            .withArg(this.describer.buildMetadataArg(data))
            .build();
    }
    getTelemetryData(success, response) {
        const quantities = this.getNumberOfRetrievedTypes(response.data);
        const rows = Object.keys(quantities).map(type => {
            return { type, quantity: quantities[type] };
        });
        return {
            properties: {
                metadataCount: JSON.stringify(rows)
            }
        };
    }
    getNumberOfRetrievedTypes(data) {
        const quantities = {};
        data.forEach(selection => {
            const current = quantities[selection.type];
            quantities[selection.type] = current ? current + 1 : 1;
        });
        return quantities;
    }
    execute(response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            const cancellationToken = cancellationTokenSource.token;
            const execution = yield new cli_1.CliCommandExecutor(this.build(response.data), {
                cwd: util_1.getRootWorkspacePath()
            }).execute(cancellationToken);
            this.attachExecution(execution, cancellationTokenSource, cancellationToken);
            const result = yield new cli_1.CommandOutput().getCmdResult(execution);
            let resultJson;
            try {
                resultJson = JSON.parse(result);
            }
            catch (error) {
                channels_1.channelService.appendLine(messages_1.nls.localize('force_org_open_default_scratch_org_container_error'));
                telemetry_1.telemetryService.sendException('force_org_open_container', `There was an error when parsing the org open response ${error}`);
            }
            if (resultJson.status === 0 && this.openAfterRetrieve) {
                const extensions = (_a = util_1.MetadataDictionary.getInfo(resultJson.result.inboundFiles[0].type)) === null || _a === void 0 ? void 0 : _a.extensions;
                const filesToOpen = [];
                if (extensions) {
                    for (const ext of extensions) {
                        const tmpFile = resultJson.result.inboundFiles.find(({ filePath }) => filePath.endsWith(ext));
                        filesToOpen.push(path.join(util_1.getRootWorkspacePath(), tmpFile.filePath));
                    }
                }
                else {
                    const tmpFile = resultJson.result.inboundFiles.find(({ filePath }) => filePath.endsWith('-meta.xml'));
                    filesToOpen.push(path.join(util_1.getRootWorkspacePath(), tmpFile.filePath));
                }
                for (const file of filesToOpen) {
                    const showOptions = {
                        preview: false
                    };
                    const document = yield vscode.workspace.openTextDocument(file);
                    vscode.window.showTextDocument(document, showOptions);
                }
            }
        });
    }
}
exports.ForceSourceRetrieveExecutor = ForceSourceRetrieveExecutor;
class LibraryRetrieveSourcePathExecutor extends baseDeployRetrieve_1.RetrieveExecutor {
    constructor(openAfterRetrieve = false) {
        super(messages_1.nls.localize('force_source_retrieve_text'), 'force_source_retrieve_beta');
        this.openAfterRetrieve = openAfterRetrieve;
    }
    getComponents(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = new source_deploy_retrieve_1.ComponentSet(response.data.map(lc => ({ fullName: lc.fileName, type: lc.type })));
            const packageDirs = yield sfdxProject_1.SfdxPackageDirectories.getPackageDirectoryFullPaths();
            for (const dir of packageDirs) {
                filter.resolveSourceComponents(dir, { filter });
            }
            return filter;
        });
    }
    postOperation(result) {
        const _super = Object.create(null, {
            postOperation: { get: () => super.postOperation }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.postOperation.call(this, result);
            // assumes opening only one component
            if (result && this.openAfterRetrieve) {
                let componentToOpen;
                if (result instanceof source_deploy_retrieve_1.RetrieveResult) {
                    componentToOpen = result.components.getSourceComponents().first();
                }
                else {
                    componentToOpen = (_a = result.successes[0]) === null || _a === void 0 ? void 0 : _a.component;
                }
                if (componentToOpen) {
                    const dirPath = (yield sfdxProject_1.SfdxPackageDirectories.getDefaultPackageDir()) || '';
                    const defaultOutput = path.join(util_1.getRootWorkspacePath(), dirPath);
                    const compSet = source_deploy_retrieve_1.ComponentSet.fromSource(defaultOutput);
                    yield this.openResources(this.findResources(componentToOpen, compSet));
                }
            }
        });
    }
    findResources(filter, compSet) {
        if (compSet && compSet.size > 0) {
            const oneComp = compSet.getSourceComponents(filter).first();
            const filesToOpen = [];
            if (oneComp) {
                if (oneComp.xml) {
                    filesToOpen.push(oneComp.xml);
                }
                for (const filePath of oneComp.walkContent()) {
                    filesToOpen.push(filePath);
                }
            }
            return filesToOpen;
        }
        return [];
    }
    openResources(filesToOpen) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const file of filesToOpen) {
                const showOptions = {
                    preview: false
                };
                const document = yield vscode.workspace.openTextDocument(file);
                vscode.window.showTextDocument(document, showOptions);
            }
        });
    }
}
exports.LibraryRetrieveSourcePathExecutor = LibraryRetrieveSourcePathExecutor;
function forceSourceRetrieveCmp(trigger, openAfterRetrieve = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const retrieveDescriber = trigger.describer();
        const commandlet = new util_2.SfdxCommandlet(new util_2.SfdxWorkspaceChecker(), new parameterGatherers_1.RetrieveComponentOutputGatherer(retrieveDescriber), settings_1.sfdxCoreSettings.getBetaDeployRetrieve()
            ? new LibraryRetrieveSourcePathExecutor(openAfterRetrieve)
            : new ForceSourceRetrieveExecutor(retrieveDescriber, openAfterRetrieve), new postconditionCheckers_1.OverwriteComponentPrompt());
        yield commandlet.run();
    });
}
exports.forceSourceRetrieveCmp = forceSourceRetrieveCmp;
//# sourceMappingURL=forceSourceRetrieveCmp.js.map