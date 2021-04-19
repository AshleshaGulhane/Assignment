import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { FlagParameter, SfdxCommandletExecutor } from './util';
export declare class ForceSourcePullExecutor extends SfdxCommandletExecutor<{}> {
    private flag;
    constructor(flag?: string);
    build(data: {}): Command;
}
export declare function forceSourcePull(this: FlagParameter<string>): Promise<void>;
