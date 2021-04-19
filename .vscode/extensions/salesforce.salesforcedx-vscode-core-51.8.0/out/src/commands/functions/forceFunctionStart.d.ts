import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { ContinueResponse } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { SfdxCommandletExecutor } from '../util';
import { Uri } from 'vscode';
export declare class ForceFunctionStartExecutor extends SfdxCommandletExecutor<string> {
    build(functionDirPath: string): Command;
    execute(response: ContinueResponse<string>): void;
}
/**
 * Executes sfdx evergreen:function:start --verbose
 * @param sourceUri
 */
export declare function forceFunctionStart(sourceUri?: Uri): Promise<void>;
