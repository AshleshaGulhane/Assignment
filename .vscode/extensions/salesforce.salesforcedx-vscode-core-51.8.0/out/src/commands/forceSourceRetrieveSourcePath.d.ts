import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { PostconditionChecker } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { CancelResponse, ContinueResponse } from '@salesforce/salesforcedx-utils-vscode/out/src/types/index';
import { ComponentSet } from '@salesforce/source-deploy-retrieve';
import * as vscode from 'vscode';
import { RetrieveExecutor } from './baseDeployRetrieve';
import { SfdxCommandletExecutor } from './util';
export declare class ForceSourceRetrieveSourcePathExecutor extends SfdxCommandletExecutor<string> {
    build(sourcePath: string): Command;
}
export declare class LibraryRetrieveSourcePathExecutor extends RetrieveExecutor<string> {
    constructor();
    protected getComponents(response: ContinueResponse<string>): Promise<ComponentSet>;
}
export declare class SourcePathChecker implements PostconditionChecker<string> {
    check(inputs: ContinueResponse<string> | CancelResponse): Promise<ContinueResponse<string> | CancelResponse>;
}
export declare function forceSourceRetrieveSourcePath(explorerPath: vscode.Uri): Promise<void>;
