"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const context_1 = require("./context");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.shouldExecuteForDocument = (uri) => {
    if (context_1.SLDSContext.isEnable(context_1.ContextKey.SCOPE)) {
        if (uri.scheme === 'file') {
            const filePath = uri.fsPath.split(path.sep);
            const locationOfForceApp = filePath.indexOf('force-app');
            if (locationOfForceApp !== -1) {
                return fs.existsSync(path.resolve(...filePath.slice(0, locationOfForceApp), `sfdx-project.json`));
            }
        }
        return false;
    }
    return true;
};
exports.shouldSendPayloadToServer = (payload) => {
    if (context_1.SLDSContext.isEnable(context_1.ContextKey.SCOPE)) {
        const result = payload.match(/"method":"textDocument\/\w+".+"textDocument":{"uri":"([^"]+)"/);
        if (result) {
            const textDocument = result[1];
            return exports.shouldExecuteForDocument(vscode.Uri.parse(textDocument));
        }
    }
    return true;
};
//# sourceMappingURL=utilities.js.map