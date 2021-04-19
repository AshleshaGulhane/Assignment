"use strict";
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const contextKey_1 = require("./contextKey");
const CONFIG_KEY = 'salesforcedx-vscode-slds';
const MAPPINGS = new Map([
    [contextKey_1.ContextKey.GLOBAL, 'enabled'],
    [contextKey_1.ContextKey.AUTO_SUGGEST, 'enhancements.autoSuggest'],
    [contextKey_1.ContextKey.BEM, 'basic.bemNaming'],
    [contextKey_1.ContextKey.DENSITY, 'enhancements.density'],
    [contextKey_1.ContextKey.DEPRECATED, 'basic.deprecated'],
    [contextKey_1.ContextKey.OVERRIDE, 'basic.override'],
    [contextKey_1.ContextKey.DESIGN_TOKEN, 'basic.designToken'],
    [contextKey_1.ContextKey.INVALID, 'basic.invalid'],
    [contextKey_1.ContextKey.UTILITY_CLASS, 'enhancements.utilityClasses'],
    [contextKey_1.ContextKey.SCOPE, 'file.scopeWithInSFDX']
]);
class SLDSContext {
    constructor(context, languageClient) {
        this.context = context;
        this.languageClient = languageClient;
        this.configuration = vscode.workspace.getConfiguration(CONFIG_KEY);
        this.upgradeContextConfiguration(context);
        this.syncContextWithServer(MAPPINGS.keys());
        vscode.workspace.onDidChangeConfiguration((e) => this.configurationChangeHandler(e));
    }
    upgradeContextConfiguration(context) {
        for (let [key] of MAPPINGS) {
            const result = context.globalState.get(key);
            if (result !== undefined) {
                this.updateState(key, result);
                context.globalState.update(key, undefined);
            }
        }
    }
    configurationChangeHandler(event) {
        const keys = [];
        for (let [key, value] of MAPPINGS) {
            if (event.affectsConfiguration(`${CONFIG_KEY}.${value}`)) {
                keys.push(key);
            }
        }
        if (keys.length !== 0) {
            this.syncContextWithServer(keys);
        }
    }
    syncContextWithServer(keys) {
        this.languageClient.onReady().then(() => {
            for (let key of keys) {
                const contextKey = key;
                const value = SLDSContext.isEnable(contextKey);
                if (SLDSContext.shouldNotifyServerOfContextChange(contextKey)) {
                    this.languageClient.sendNotification('state/updateState', { key, value });
                }
            }
        });
    }
    updateState(key, value) {
        //accounting for situtation where workspace is not available
        const setGlobal = vscode.workspace.name === undefined;
        this.configuration.update(MAPPINGS.get(key), value, setGlobal);
    }
    static shouldNotifyServerOfContextChange(key) {
        return key !== contextKey_1.ContextKey.SCOPE;
    }
    static isEnable(...keys) {
        const workspace = vscode.workspace.getConfiguration(CONFIG_KEY);
        for (let key of keys) {
            const value = workspace.get(MAPPINGS.get(key));
            if (value === false) {
                return false;
            }
            /*
                Disable Utility Class Detection
                See Issue For More Context: https://github.com/forcedotcom/salesforcedx-slds-lsp/issues/22
            */
            if (key === contextKey_1.ContextKey.UTILITY_CLASS) {
                return false;
            }
        }
        return true;
    }
}
exports.SLDSContext = SLDSContext;
//# sourceMappingURL=context.js.map