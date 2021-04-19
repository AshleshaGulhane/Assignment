import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { SfdxCommandletExecutor } from './util';
export declare class ForceAuthLogoutAll extends SfdxCommandletExecutor<{}> {
    static withoutShowingChannel(): ForceAuthLogoutAll;
    build(data: {}): Command;
}
export declare function forceAuthLogoutAll(): Promise<void>;
