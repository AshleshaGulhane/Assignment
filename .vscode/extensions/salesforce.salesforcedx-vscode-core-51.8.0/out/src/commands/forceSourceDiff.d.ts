import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { ContinueResponse } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import * as vscode from 'vscode';
import { SfdxCommandletExecutor } from './util';
export declare class ForceSourceDiffExecutor extends SfdxCommandletExecutor<string> {
    build(filePath: string): Command;
    execute(response: ContinueResponse<string>): Promise<void>;
}
export declare function handleDiffResponse(exitCode: number | undefined, stdOut: string): Promise<void>;
export declare function forceSourceDiff(sourceUri: vscode.Uri): Promise<void>;
