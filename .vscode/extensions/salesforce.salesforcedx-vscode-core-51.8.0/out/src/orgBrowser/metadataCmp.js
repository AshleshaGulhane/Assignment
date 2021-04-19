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
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const helpers_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/helpers");
const fs = require("fs");
const path = require("path");
const commands_1 = require("../commands");
const messages_1 = require("../messages");
const telemetry_1 = require("../telemetry");
const util_1 = require("../util");
const validManageableStates = new Set([
    'unmanaged',
    'installedEditable',
    'deprecatedEditable',
    undefined // not part of a package
]);
class ComponentUtils {
    getComponentsPath(metadataType, defaultUsernameOrAlias, folder) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!util_1.hasRootWorkspace()) {
                const err = messages_1.nls.localize('cannot_determine_workspace');
                telemetry_1.telemetryService.sendException('metadata_cmp_workspace', err);
                throw new Error(err);
            }
            const username = yield util_1.OrgAuthInfo.getUsername(defaultUsernameOrAlias);
            const fileName = `${folder ? `${metadataType}_${folder}` : metadataType}.json`;
            const componentsPath = path.join(util_1.getRootWorkspacePath(), '.sfdx', 'orgs', username, 'metadata', fileName);
            return componentsPath;
        });
    }
    buildComponentsList(metadataType, componentsFile, componentsPath) {
        try {
            if (helpers_1.isNullOrUndefined(componentsFile)) {
                componentsFile = fs.readFileSync(componentsPath, 'utf8');
            }
            const jsonObject = JSON.parse(componentsFile);
            let cmpArray = jsonObject.result;
            const components = [];
            if (!helpers_1.isNullOrUndefined(cmpArray)) {
                cmpArray = cmpArray instanceof Array ? cmpArray : [cmpArray];
                for (const cmp of cmpArray) {
                    const { fullName, manageableState } = cmp;
                    if (!helpers_1.isNullOrUndefined(fullName) &&
                        validManageableStates.has(manageableState)) {
                        components.push(fullName);
                    }
                }
            }
            telemetry_1.telemetryService.sendEventData('Metadata Components quantity', { metadataType }, { metadataComponents: components.length });
            return components.sort();
        }
        catch (e) {
            telemetry_1.telemetryService.sendException('metadata_cmp_build_cmp_list', e.message);
            throw new Error(e);
        }
    }
    loadComponents(defaultOrg, metadataType, folder, forceRefresh) {
        return __awaiter(this, void 0, void 0, function* () {
            const componentsPath = yield this.getComponentsPath(metadataType, defaultOrg, folder);
            let componentsList;
            if (forceRefresh || !fs.existsSync(componentsPath)) {
                const result = yield commands_1.forceListMetadata(metadataType, defaultOrg, componentsPath, folder);
                componentsList = this.buildComponentsList(metadataType, result, undefined);
            }
            else {
                componentsList = this.buildComponentsList(metadataType, undefined, componentsPath);
            }
            return componentsList;
        });
    }
}
exports.ComponentUtils = ComponentUtils;
//# sourceMappingURL=metadataCmp.js.map