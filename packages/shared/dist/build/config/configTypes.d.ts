/**
 * Configuration Type Registry
 *
 * This file defines all supported configuration types and their metadata.
 * New configuration types can be added here without code changes.
 */
export interface ConfigTypeMetadata {
    type: string;
    name: string;
    description: string;
    supportsVersioning: boolean;
    apiEndpoints: {
        list: string;
        get: (id: string) => string;
        create: string;
        update: (id: string) => string;
        delete: (id: string) => string;
        archive: (id: string) => string;
        unarchive: (id: string) => string;
        clone: (id: string) => string;
        history: (id: string) => string;
        render?: (id: string) => string;
        test?: (id: string) => string;
    };
    defaultContent?: Record<string, any>;
    requiredForJob: boolean;
    icon?: string;
}
declare const configTypes: Record<string, ConfigTypeMetadata>;
declare const backwardCompatibilityAliases: Record<string, string>;
export { configTypes, backwardCompatibilityAliases };
export default configTypes;
