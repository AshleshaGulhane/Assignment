import { CancelResponse, ContinueResponse, LocalComponent, PostconditionChecker } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { DirectoryDiffResults } from '../../conflict';
declare type OneOrMany = LocalComponent | LocalComponent[];
declare type ContinueOrCancel = ContinueResponse<OneOrMany> | CancelResponse;
export declare class EmptyPostChecker implements PostconditionChecker<any> {
    check(inputs: ContinueResponse<any> | CancelResponse): Promise<ContinueResponse<any> | CancelResponse>;
}
export declare class OverwriteComponentPrompt implements PostconditionChecker<OneOrMany> {
    check(inputs: ContinueOrCancel): Promise<ContinueOrCancel>;
    private componentExists;
    private getFileExtensions;
    promptOverwrite(foundComponents: LocalComponent[]): Promise<Set<LocalComponent> | undefined>;
    private buildDialogMessage;
    private buildDialogOptions;
}
export interface ConflictDetectionMessages {
    warningMessageKey: string;
    commandHint: (input: string) => string;
}
export declare class ConflictDetectionChecker implements PostconditionChecker<string> {
    private messages;
    constructor(messages: ConflictDetectionMessages);
    check(inputs: ContinueResponse<string> | CancelResponse): Promise<ContinueResponse<string> | CancelResponse>;
    handleConflicts(manifest: string, usernameOrAlias: string, defaultPackageDir: string, results: DirectoryDiffResults): Promise<ContinueResponse<string> | CancelResponse>;
    getDefaultUsernameOrAlias(): Promise<string | undefined>;
}
export {};
