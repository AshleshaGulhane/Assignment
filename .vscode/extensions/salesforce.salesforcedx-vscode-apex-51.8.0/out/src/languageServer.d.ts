import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient';
export declare function code2ProtocolConverter(value: vscode.Uri): string;
export declare function createLanguageServer(context: vscode.ExtensionContext): Promise<LanguageClient>;
