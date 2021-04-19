import { LibraryCommandletExecutor, SfdxCommandletExecutor } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { CancelResponse, ContinueResponse, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import * as vscode from 'vscode';
declare type TempFile = {
    fileName: string;
};
export declare class CreateApexTempFile implements ParametersGatherer<TempFile> {
    gather(): Promise<CancelResponse | ContinueResponse<TempFile>>;
}
export declare class ForceApexExecuteExecutor extends SfdxCommandletExecutor<{}> {
    constructor();
    build(data: TempFile): Command;
}
interface ApexExecuteParameters {
    apexCode?: string;
    fileName?: string;
}
export declare class AnonApexGatherer implements ParametersGatherer<ApexExecuteParameters> {
    gather(): Promise<CancelResponse | ContinueResponse<ApexExecuteParameters>>;
}
export declare class ApexLibraryExecuteExecutor extends LibraryCommandletExecutor<ApexExecuteParameters> {
    static diagnostics: vscode.DiagnosticCollection;
    constructor();
    run(response: ContinueResponse<ApexExecuteParameters>): Promise<boolean>;
    private outputResult;
    private handleDiagnostics;
    private getZeroBasedRange;
}
export declare function forceApexExecute(): Promise<void>;
export {};
