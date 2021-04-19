import { LibraryCommandletExecutor, SfdxCommandletExecutor } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { CancelResponse, ContinueResponse, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import * as vscode from 'vscode';
export declare enum TestType {
    All = 0,
    Suite = 1,
    Class = 2
}
export interface ApexTestQuickPickItem extends vscode.QuickPickItem {
    type: TestType;
}
export declare class TestsSelector implements ParametersGatherer<ApexTestQuickPickItem> {
    gather(): Promise<CancelResponse | ContinueResponse<ApexTestQuickPickItem>>;
}
export declare class ForceApexTestRunCommandFactory {
    private data;
    private getCodeCoverage;
    private builder;
    private testRunExecutorCommand;
    private outputToJson;
    constructor(data: ApexTestQuickPickItem, getCodeCoverage: boolean, outputToJson: string);
    constructExecutorCommand(): Command;
}
export declare class ForceApexTestRunExecutor extends SfdxCommandletExecutor<ApexTestQuickPickItem> {
    constructor();
    build(data: ApexTestQuickPickItem): Command;
}
export declare class ApexLibraryTestRunExecutor extends LibraryCommandletExecutor<ApexTestQuickPickItem> {
    protected cancellable: boolean;
    static diagnostics: vscode.DiagnosticCollection;
    constructor();
    run(response: ContinueResponse<ApexTestQuickPickItem>, progress?: vscode.Progress<{
        message?: string | undefined;
        increment?: number | undefined;
    }>, token?: vscode.CancellationToken): Promise<boolean>;
}
export declare function forceApexTestRun(): Promise<void>;
