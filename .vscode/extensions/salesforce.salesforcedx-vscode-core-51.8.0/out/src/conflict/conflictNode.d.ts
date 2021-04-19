import * as vscode from 'vscode';
export declare type ConflictFile = {
    remoteLabel: string;
    fileName: string;
    relPath: string;
    localPath: string;
    remotePath: string;
};
export declare class ConflictNode extends vscode.TreeItem {
    private _children;
    private _parent;
    protected _conflict: ConflictFile | undefined;
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, parent?: ConflictNode);
    get conflict(): ConflictFile | undefined;
    get parent(): ConflictNode | undefined;
    get children(): ConflictNode[];
    get tooltip(): string | undefined;
}
export declare class ConflictFileNode extends ConflictNode {
    constructor(conflict: ConflictFile, parent: ConflictNode);
    attachCommands(): void;
}
export declare class ConflictGroupNode extends ConflictNode {
    constructor(label: string);
    addChildren(conflicts: ConflictFile[]): void;
}
