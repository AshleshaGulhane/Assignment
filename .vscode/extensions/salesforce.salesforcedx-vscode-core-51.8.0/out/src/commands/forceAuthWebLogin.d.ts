import * as vscode from 'vscode';
import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { CancelResponse, ContinueResponse, ParametersGatherer } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { SfdxCommandletExecutor } from './util';
export declare const DEFAULT_ALIAS = "vscodeOrg";
export declare const PRODUCTION_URL = "https://login.salesforce.com";
export declare const SANDBOX_URL = "https://test.salesforce.com";
export declare class ForceAuthWebLoginExecutor extends SfdxCommandletExecutor<AuthParams> {
    protected showChannelOutput: boolean;
    build(data: AuthParams): Command;
}
export declare abstract class ForceAuthDemoModeExecutor<T> extends SfdxCommandletExecutor<T> {
    execute(response: ContinueResponse<T>): Promise<void>;
}
export declare class ForceAuthWebLoginDemoModeExecutor extends ForceAuthDemoModeExecutor<AuthParams> {
    build(data: AuthParams): Command;
}
export declare class OrgTypeItem implements vscode.QuickPickItem {
    label: string;
    detail: string;
    constructor(localizeLabel: string, localizeDetail: string);
}
export declare class AuthParamsGatherer implements ParametersGatherer<AuthParams> {
    readonly orgTypes: {
        project: OrgTypeItem;
        production: OrgTypeItem;
        sandbox: OrgTypeItem;
        custom: OrgTypeItem;
    };
    static readonly validateUrl: (url: string) => string | null;
    getProjectLoginUrl(): Promise<string | undefined>;
    getQuickPickItems(): Promise<vscode.QuickPickItem[]>;
    gather(): Promise<CancelResponse | ContinueResponse<AuthParams>>;
}
export interface AuthParams {
    alias: string;
    loginUrl: string;
}
export declare function promptLogOutForProdOrg(): Promise<void>;
export declare function createAuthWebLoginExecutor(): SfdxCommandletExecutor<{}>;
export declare function forceAuthWebLogin(): Promise<void>;
