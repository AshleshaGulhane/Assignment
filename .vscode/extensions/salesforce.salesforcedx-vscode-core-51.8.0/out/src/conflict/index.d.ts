import { Disposable, ExtensionContext } from 'vscode';
import { ConflictDetector } from './conflictDetectionService';
import { ConflictView } from './conflictView';
export { ConflictDetectionConfig, ConflictDetector } from './conflictDetectionService';
export { CommonDirDirectoryDiffer, DirectoryDiffer, DirectoryDiffResults } from './directoryDiffer';
export declare const conflictView: ConflictView;
export declare const conflictDetector: ConflictDetector;
export declare function setupConflictView(extensionContext: ExtensionContext): Promise<void>;
export declare function registerConflictView(): Disposable;
