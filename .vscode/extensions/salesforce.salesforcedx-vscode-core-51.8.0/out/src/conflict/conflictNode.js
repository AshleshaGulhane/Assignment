"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const vscode = require("vscode");
const messages_1 = require("../messages");
class ConflictNode extends vscode.TreeItem {
    constructor(label, collapsibleState, parent) {
        super(label, collapsibleState);
        this._children = [];
        this._parent = parent;
    }
    get conflict() {
        return this._conflict;
    }
    get parent() {
        return this._parent;
    }
    get children() {
        return this._children;
    }
    get tooltip() {
        return this._conflict ? this._conflict.relPath : this.label;
    }
}
exports.ConflictNode = ConflictNode;
class ConflictFileNode extends ConflictNode {
    constructor(conflict, parent) {
        super(conflict.fileName, vscode.TreeItemCollapsibleState.None, parent);
        this._conflict = conflict;
    }
    attachCommands() {
        this.contextValue = 'conflict-actions';
        this.command = {
            title: messages_1.nls.localize('conflict_detect_diff_command_title'),
            command: 'sfdx.force.conflict.diff',
            arguments: [this._conflict]
        };
    }
}
exports.ConflictFileNode = ConflictFileNode;
class ConflictGroupNode extends ConflictNode {
    constructor(label) {
        super(label, vscode.TreeItemCollapsibleState.Expanded);
    }
    addChildren(conflicts) {
        if (conflicts.length === 0) {
            this.children.push(new ConflictNode(messages_1.nls.localize('conflict_detect_no_conflicts'), vscode.TreeItemCollapsibleState.None));
        }
        conflicts.forEach(entry => {
            const child = new ConflictFileNode(entry, this);
            child.attachCommands();
            this.children.push(child);
        });
    }
}
exports.ConflictGroupNode = ConflictGroupNode;
//# sourceMappingURL=conflictNode.js.map