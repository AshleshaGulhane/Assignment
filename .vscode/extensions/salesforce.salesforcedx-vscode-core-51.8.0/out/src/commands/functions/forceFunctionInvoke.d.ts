/**
 * Executes sfdx evergreen:function:invoke http://localhost:8080 --payload=@functions/MyFunction/payload.json
 */
import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { Uri } from 'vscode';
import { SfdxCommandletExecutor } from '../util';
export declare class ForceFunctionInvoke extends SfdxCommandletExecutor<string> {
    build(payloadUri: string): Command;
}
export declare function forceFunctionInvoke(sourceUri: Uri): Promise<void>;
export declare function forceFunctionDebugInvoke(sourceUri: Uri): Promise<void>;
