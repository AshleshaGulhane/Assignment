"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
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
/**
 * Executes sfdx evergreen:function:invoke http://localhost:8080 --payload=@functions/MyFunction/payload.json
 */
const cli_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/cli");
const messages_1 = require("../../messages");
const notifications_1 = require("../../notifications");
const telemetry_1 = require("../../telemetry");
const util_1 = require("../util");
const functionService_1 = require("./functionService");
class ForceFunctionInvoke extends util_1.SfdxCommandletExecutor {
    build(payloadUri) {
        return new cli_1.SfdxCommandBuilder()
            .withDescription(messages_1.nls.localize('force_function_invoke_text'))
            .withArg('evergreen:function:invoke')
            .withArg('http://localhost:8080')
            .withFlag('--payload', `@${payloadUri}`)
            .withLogName('force_function_invoke')
            .build();
    }
}
exports.ForceFunctionInvoke = ForceFunctionInvoke;
function forceFunctionInvoke(sourceUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandlet = new util_1.SfdxCommandlet(new util_1.SfdxWorkspaceChecker(), new util_1.FilePathGatherer(sourceUri), new ForceFunctionInvoke());
        yield commandlet.run();
    });
}
exports.forceFunctionInvoke = forceFunctionInvoke;
function forceFunctionDebugInvoke(sourceUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const localRoot = functionService_1.FunctionService.getFunctionDir(sourceUri.fsPath);
        if (!localRoot) {
            const warningMessage = messages_1.nls.localize('force_function_start_warning_no_toml');
            notifications_1.notificationService.showWarningMessage(warningMessage);
            telemetry_1.telemetryService.sendException('force_function_debug_invoke_no_toml', warningMessage);
            return;
        }
        yield functionService_1.FunctionService.instance.debugFunction(localRoot);
        const commandlet = new util_1.SfdxCommandlet(new util_1.SfdxWorkspaceChecker(), new util_1.FilePathGatherer(sourceUri), new ForceFunctionInvoke());
        yield commandlet.run();
        if (commandlet.onDidFinishExecution) {
            commandlet.onDidFinishExecution((startTime) => __awaiter(this, void 0, void 0, function* () {
                yield functionService_1.FunctionService.instance.stopDebuggingFunction(localRoot);
                telemetry_1.telemetryService.sendCommandEvent('force_function_debug_invoke', startTime);
            }));
        }
    });
}
exports.forceFunctionDebugInvoke = forceFunctionDebugInvoke;
//# sourceMappingURL=forceFunctionInvoke.js.map