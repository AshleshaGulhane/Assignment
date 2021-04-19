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
const cli_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/cli");
const messages_1 = require("../messages");
const util_1 = require("./util");
class ForceAuthLogoutAll extends util_1.SfdxCommandletExecutor {
    static withoutShowingChannel() {
        const instance = new ForceAuthLogoutAll();
        instance.showChannelOutput = false;
        return instance;
    }
    build(data) {
        return new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_auth_logout_all_text'))
            .withArg('force:auth:logout')
            .withArg('--all')
            .withArg('--noprompt')
            .withLogName('force_auth_logout')
            .build();
    }
}
exports.ForceAuthLogoutAll = ForceAuthLogoutAll;
const workspaceChecker = new util_1.SfdxWorkspaceChecker();
const parameterGatherer = new util_1.EmptyParametersGatherer();
const executor = new ForceAuthLogoutAll();
const commandlet = new util_1.SfdxCommandlet(workspaceChecker, parameterGatherer, executor);
function forceAuthLogoutAll() {
    return __awaiter(this, void 0, void 0, function* () {
        yield commandlet.run();
    });
}
exports.forceAuthLogoutAll = forceAuthLogoutAll;
//# sourceMappingURL=forceAuthLogout.js.map