import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { ContinueResponse, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { ComponentSet } from '@salesforce/source-deploy-retrieve';
import * as vscode from 'vscode';
import { BaseDeployExecutor, DeployType } from './baseDeployCommand';
import { DeployExecutor } from './baseDeployRetrieve';
export declare class ForceSourceDeploySourcePathExecutor extends BaseDeployExecutor {
    build(sourcePath: string): Command;
    protected getDeployType(): DeployType;
}
export declare class LibraryDeploySourcePathExecutor extends DeployExecutor<string | string[]> {
    constructor();
    protected getComponents(response: ContinueResponse<string | string[]>): Promise<ComponentSet>;
}
export declare class MultipleSourcePathsGatherer implements ParametersGatherer<string> {
    private uris;
    constructor(uris: vscode.Uri[]);
    gather(): Promise<ContinueResponse<string>>;
}
export declare class LibraryPathsGatherer implements ParametersGatherer<string[]> {
    private uris;
    constructor(uris: vscode.Uri[]);
    gather(): Promise<ContinueResponse<string[]>>;
}
export declare function forceSourceDeploySourcePath(sourceUri: vscode.Uri): Promise<void>;
export declare function forceSourceDeployMultipleSourcePaths(uris: vscode.Uri[]): Promise<void>;
