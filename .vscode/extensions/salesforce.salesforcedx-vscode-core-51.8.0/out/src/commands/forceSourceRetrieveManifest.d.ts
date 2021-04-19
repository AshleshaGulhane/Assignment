import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { ContinueResponse } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { ComponentSet } from '@salesforce/source-deploy-retrieve';
import * as vscode from 'vscode';
import { RetrieveExecutor } from './baseDeployRetrieve';
import { SfdxCommandletExecutor } from './util';
export declare class ForceSourceRetrieveManifestExecutor extends SfdxCommandletExecutor<string> {
    build(manifestPath: string): Command;
}
export declare class LibrarySourceRetrieveManifestExecutor extends RetrieveExecutor<string> {
    constructor();
    protected getComponents(response: ContinueResponse<string>): Promise<ComponentSet>;
}
export declare function forceSourceRetrieveManifest(explorerPath: vscode.Uri): Promise<void>;
