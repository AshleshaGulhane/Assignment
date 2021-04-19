import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { FlagParameter, SfdxCommandletExecutor } from './util';
export declare enum SourceStatusFlags {
    Local = "--local",
    Remote = "--remote"
}
export declare class ForceSourceStatusExecutor extends SfdxCommandletExecutor<{}> {
    private flag;
    constructor(flag?: SourceStatusFlags);
    build(data: {}): Command;
}
export declare function forceSourceStatus(this: FlagParameter<SourceStatusFlags>): Promise<void>;
