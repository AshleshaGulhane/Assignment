import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { ContinueResponse } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { ComponentSet } from '@salesforce/source-deploy-retrieve';
import * as vscode from 'vscode';
import { BaseDeployExecutor, DeployType } from './baseDeployCommand';
import { DeployExecutor } from './baseDeployRetrieve';
export declare class ForceSourceDeployManifestExecutor extends BaseDeployExecutor {
    build(manifestPath: string): Command;
    protected getDeployType(): DeployType;
}
export declare class LibrarySourceDeployManifestExecutor extends DeployExecutor<string> {
    constructor();
    protected getComponents(response: ContinueResponse<string>): Promise<ComponentSet>;
}
export declare function forceSourceDeployManifest(manifestUri: vscode.Uri): Promise<void>;
