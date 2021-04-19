import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { CancelResponse, ContinueResponse, FunctionInfo, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { BaseTemplateCommand } from './baseTemplateCommand';
export declare class ForceFunctionCreateExecutor extends BaseTemplateCommand {
    constructor();
    build(data: FunctionInfo): Command;
    runPostCommandTasks(targetDir: string): void;
}
export declare class FunctionInfoGatherer implements ParametersGatherer<FunctionInfo> {
    gather(): Promise<CancelResponse | ContinueResponse<FunctionInfo>>;
}
export declare function forceFunctionCreate(): Promise<void>;
