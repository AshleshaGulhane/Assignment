"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const workspaces_1 = require("@salesforce/salesforcedx-utils-vscode/out/src/workspaces");
const path = require("path");
function getLogDirPath() {
    return path.join(workspaces_1.getRootWorkspacePath(), '.sfdx', 'tools', 'debug', 'logs');
}
exports.getLogDirPath = getLogDirPath;
//# sourceMappingURL=index.js.map