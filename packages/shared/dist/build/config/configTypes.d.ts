/**
 * Configuration types for AI MFE Portal
 * Extensible configuration system for generic portal applications
 */
export interface ConfigType {
    name: string;
    description: string;
    supportsVersioning: boolean;
    defaultContent?: Record<string, any>;
    apiEndpoints: {
        list: string;
        get: (id: string) => string;
        create: string;
        update: (id: string) => string;
        delete: (id: string) => string;
        history: (id: string) => string;
        archive: (id: string) => string;
        unarchive: (id: string) => string;
        clone: (id: string) => string;
    };
}
export declare const configTypes: Record<string, ConfigType>;
export default configTypes;
