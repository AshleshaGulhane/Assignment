/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See OSSREADME.json in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
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
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const htmlEmptyTagsShared_1 = require("./htmlEmptyTagsShared");
const tagClosing_1 = require("./tagClosing");
const configuration_1 = require("vscode-languageclient/lib/configuration");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const telemetry_1 = require("./telemetry");
// tslint:disable-next-line:no-namespace
var TagCloseRequest;
(function (TagCloseRequest) {
    TagCloseRequest.type = new vscode_languageclient_1.RequestType('html/tag');
})(TagCloseRequest || (TagCloseRequest = {}));
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionHRStart = process.hrtime();
        const toDispose = context.subscriptions;
        // The server is implemented in node
        const serverModule = context.asAbsolutePath(path.join('node_modules', '@salesforce', 'salesforcedx-visualforce-language-server', 'out', 'src', 'visualforceServer.js'));
        // The debug options for the server
        const debugOptions = { execArgv: ['--nolazy', '--inspect=6004'] };
        // If the extension is launch in debug mode the debug server options are use
        // Otherwise the run options are used
        const serverOptions = {
            run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
            debug: {
                module: serverModule,
                transport: vscode_languageclient_1.TransportKind.ipc,
                options: debugOptions
            }
        };
        const documentSelector = [
            {
                language: 'visualforce',
                scheme: 'file'
            }
        ];
        const embeddedLanguages = { css: true, javascript: true };
        // Options to control the language client
        const clientOptions = {
            documentSelector,
            synchronize: {
                configurationSection: ['visualforce', 'css', 'javascript'] // the settings to synchronize
            },
            initializationOptions: {
                embeddedLanguages
            }
        };
        // Create the language client and start the client.
        const client = new vscode_languageclient_1.LanguageClient('visualforce', 'Visualforce Language Server', serverOptions, clientOptions);
        client.registerFeature(new configuration_1.ConfigurationFeature(client));
        let disposable = client.start();
        toDispose.push(disposable);
        client
            .onReady()
            .then(() => {
            disposable = vscode_1.languages.registerColorProvider(documentSelector, {
                provideDocumentColors(document) {
                    const params = {
                        textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(document)
                    };
                    return client
                        .sendRequest(vscode_languageserver_protocol_1.DocumentColorRequest.type, params)
                        .then(symbols => {
                        return symbols.map(symbol => {
                            const range = client.protocol2CodeConverter.asRange(symbol.range);
                            const color = new vscode_1.Color(symbol.color.red, symbol.color.green, symbol.color.blue, symbol.color.alpha);
                            return new vscode_1.ColorInformation(range, color);
                        });
                    });
                },
                provideColorPresentations(color, colorContext) {
                    const params = {
                        textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(colorContext.document),
                        range: client.code2ProtocolConverter.asRange(colorContext.range),
                        color
                    };
                    return client
                        .sendRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, params)
                        .then(presentations => {
                        return presentations.map(p => {
                            const presentation = new vscode_1.ColorPresentation(p.label);
                            presentation.textEdit =
                                p.textEdit &&
                                    client.protocol2CodeConverter.asTextEdit(p.textEdit);
                            presentation.additionalTextEdits =
                                p.additionalTextEdits &&
                                    client.protocol2CodeConverter.asTextEdits(p.additionalTextEdits);
                            return presentation;
                        });
                    });
                }
            });
            toDispose.push(disposable);
            const tagRequestor = (document, position) => {
                const param = client.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
                return client.sendRequest(TagCloseRequest.type, param);
            };
            disposable = tagClosing_1.activateTagClosing(tagRequestor, { visualforce: true }, 'visualforce.autoClosingTags');
            toDispose.push(disposable);
        })
            .catch(err => {
            // Handled by clients
            telemetry_1.telemetryService.sendExtensionActivationEvent(err);
        });
        vscode_1.languages.setLanguageConfiguration('visualforce', {
            indentationRules: {
                increaseIndentPattern: /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
                decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
            },
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
            onEnterRules: [
                {
                    beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                    afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                    action: { indentAction: vscode_1.IndentAction.IndentOutdent }
                },
                {
                    beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                    action: { indentAction: vscode_1.IndentAction.Indent }
                }
            ]
        });
        vscode_1.languages.setLanguageConfiguration('handlebars', {
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
            onEnterRules: [
                {
                    beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                    afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                    action: { indentAction: vscode_1.IndentAction.IndentOutdent }
                },
                {
                    beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                    action: { indentAction: vscode_1.IndentAction.Indent }
                }
            ]
        });
        vscode_1.languages.setLanguageConfiguration('razor', {
            wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
            onEnterRules: [
                {
                    beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                    afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                    action: { indentAction: vscode_1.IndentAction.IndentOutdent }
                },
                {
                    beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                    action: { indentAction: vscode_1.IndentAction.Indent }
                }
            ]
        });
        // Telemetry
        const sfdxCoreExtension = vscode_1.extensions.getExtension('salesforce.salesforcedx-vscode-core');
        if (sfdxCoreExtension && sfdxCoreExtension.exports) {
            telemetry_1.telemetryService.initializeService(sfdxCoreExtension.exports.telemetryService.getReporter(), sfdxCoreExtension.exports.telemetryService.isTelemetryEnabled());
        }
        telemetry_1.telemetryService.sendExtensionActivationEvent(extensionHRStart);
    });
}
exports.activate = activate;
function deactivate() {
    console.log('SFDX Visualforce Extension Deactivated');
    telemetry_1.telemetryService.sendExtensionDeactivationEvent();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map