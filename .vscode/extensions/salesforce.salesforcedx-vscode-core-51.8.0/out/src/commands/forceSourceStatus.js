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
var SourceStatusFlags;
(function (SourceStatusFlags) {
    SourceStatusFlags["Local"] = "--local";
    SourceStatusFlags["Remote"] = "--remote";
})(SourceStatusFlags = exports.SourceStatusFlags || (exports.SourceStatusFlags = {}));
class ForceSourceStatusExecutor extends util_1.SfdxCommandletExecutor {
    constructor(flag) {
        super();
        this.flag = flag;
    }
    build(data) {
        const builder = new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_source_status_text'))
            .withArg('force:source:status')
            .withLogName('force_source_status');
        if (this.flag === SourceStatusFlags.Local) {
            builder.withArg(this.flag);
            builder.withDescription(messages_1.nls.localize('force_source_status_local_text'));
            builder.withLogName('force_source_status_local');
        }
        else if (this.flag === SourceStatusFlags.Remote) {
            builder.withArg(this.flag);
            builder.withDescription(messages_1.nls.localize('force_source_status_remote_text'));
            builder.withLogName('force_source_status_remote');
        }
        return builder.build();
    }
}
exports.ForceSourceStatusExecutor = ForceSourceStatusExecutor;
const workspaceChecker = new util_1.SfdxWorkspaceChecker();
const parameterGatherer = new util_1.EmptyParametersGatherer();
function forceSourceStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        // tslint:disable-next-line:no-invalid-this
        const flag = this ? this.flag : undefined;
        const executor = new ForceSourceStatusExecutor(flag);
        const commandlet = new util_1.SfdxCommandlet(workspaceChecker, parameterGatherer, executor);
        yield commandlet.run();
    });
}
exports.forceSourceStatus = forceSourceStatus;
//# sourceMappingURL=forceSourceStatus.js.map