import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { BaseDeployExecutor, DeployType } from './baseDeployCommand';
export declare class ForceSourcePushExecutor extends BaseDeployExecutor {
    private flag;
    constructor(flag?: string);
    build(data: {}): Command;
    protected getDeployType(): DeployType;
}
export interface FlagParameter {
    flag: string;
}
export declare function forceSourcePush(this: FlagParameter): Promise<void>;
