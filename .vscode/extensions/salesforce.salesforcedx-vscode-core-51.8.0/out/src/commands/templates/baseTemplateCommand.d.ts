import { ContinueResponse, DirFileNameSelection } from '@salesforce/salesforcedx-utils-vscode/out/src/types';
import { SfdxCommandletExecutor, SourcePathStrategy } from '../util';
export declare abstract class BaseTemplateCommand extends SfdxCommandletExecutor<DirFileNameSelection> {
    private metadataType;
    constructor(type: string);
    execute(response: ContinueResponse<DirFileNameSelection>): void;
    protected runPostCommandTasks(targetDir: string): void;
    private identifyDirType;
    private getPathToSource;
    getSourcePathStrategy(): SourcePathStrategy;
    getFileExtension(): string;
    setFileExtension(extension: string): void;
    getDefaultDirectory(): string;
}
