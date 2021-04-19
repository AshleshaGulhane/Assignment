import { TelemetryData } from '@salesforce/salesforcedx-utils-vscode/out/src';
import { Command } from '@salesforce/salesforcedx-utils-vscode/out/src/cli';
import { ContinueResponse, LocalComponent } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { ComponentSet, RetrieveResult } from '@salesforce/source-deploy-retrieve';
import { SourceRetrieveResult } from '@salesforce/source-deploy-retrieve/lib/src/client/types';
import { RetrieveDescriber, RetrieveMetadataTrigger } from '.';
import { RetrieveExecutor } from '../baseDeployRetrieve';
import { SfdxCommandletExecutor } from '../util';
export declare class ForceSourceRetrieveExecutor extends SfdxCommandletExecutor<LocalComponent[]> {
    private describer;
    private openAfterRetrieve;
    constructor(describer: RetrieveDescriber, openAfterRetrieve?: boolean);
    build(data?: LocalComponent[]): Command;
    protected getTelemetryData(success: boolean, response: ContinueResponse<LocalComponent[]>): TelemetryData;
    private getNumberOfRetrievedTypes;
    execute(response: any): Promise<void>;
}
export declare class LibraryRetrieveSourcePathExecutor extends RetrieveExecutor<LocalComponent[]> {
    private openAfterRetrieve;
    constructor(openAfterRetrieve?: boolean);
    protected getComponents(response: ContinueResponse<LocalComponent[]>): Promise<ComponentSet>;
    protected postOperation(result: RetrieveResult | SourceRetrieveResult | undefined): Promise<void>;
    private findResources;
    private openResources;
}
export declare function forceSourceRetrieveCmp(trigger: RetrieveMetadataTrigger, openAfterRetrieve?: boolean): Promise<void>;
