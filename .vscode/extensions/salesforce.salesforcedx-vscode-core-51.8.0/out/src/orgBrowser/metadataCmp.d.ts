export declare class ComponentUtils {
    getComponentsPath(metadataType: string, defaultUsernameOrAlias: string, folder?: string): Promise<string>;
    buildComponentsList(metadataType: string, componentsFile?: string, componentsPath?: string): string[];
    loadComponents(defaultOrg: string, metadataType: string, folder?: string, forceRefresh?: boolean): Promise<string[]>;
}
