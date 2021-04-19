import { LogRecord } from '@salesforce/apex-node';
import { LibraryCommandletExecutor, SfdxCommandletExecutor } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { CancelResponse, ContinueResponse, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import * as vscode from 'vscode';
export declare type ApexDebugLogIdStartTime = {
    id: string;
    startTime: string;
};
export declare class LogFileSelector implements ParametersGatherer<ApexDebugLogIdStartTime> {
    gather(): Promise<CancelResponse | ContinueResponse<ApexDebugLogIdStartTime>>;
    getLogRecords(): Promise<LogRecord[]>;
}
export declare type ApexDebugLogObject = {
    Id: string;
    StartTime: string;
    LogLength: number;
    Operation: string;
    Request: string;
    Status: string;
    LogUser: {
        Name: string;
    };
};
export declare class ForceApexLogList {
    static getLogs(cancellationTokenSource: vscode.CancellationTokenSource): Promise<ApexDebugLogObject[]>;
}
export declare class ForceApexLogGetExecutor extends SfdxCommandletExecutor<ApexDebugLogIdStartTime> {
    constructor();
    build(data: ApexDebugLogIdStartTime): Command;
    execute(response: ContinueResponse<ApexDebugLogIdStartTime>): Promise<void>;
}
export declare class ApexLibraryGetLogsExecutor extends LibraryCommandletExecutor<{
    id: string;
}> {
    constructor();
    run(response: ContinueResponse<{
        id: string;
    }>): Promise<boolean>;
}
export declare function forceApexLogGet(explorerDir?: any): Promise<void>;
