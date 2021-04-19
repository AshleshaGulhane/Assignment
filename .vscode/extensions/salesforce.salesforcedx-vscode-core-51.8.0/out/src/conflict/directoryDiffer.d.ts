export interface DirectoryDiffResults {
    different: Set<string>;
    localRoot: string;
    remoteRoot: string;
    scannedLocal: number;
    scannedRemote: number;
}
export interface DirectoryDiffer {
    diff(localSourcePath: string, remoteSourcePath: string): DirectoryDiffResults;
}
export declare class CommonDirDirectoryDiffer implements DirectoryDiffer {
    constructor();
    diff(localSourcePath: string, remoteSourcePath: string): DirectoryDiffResults;
    private filesDiffer;
    private listFiles;
    private walkFiles;
}
