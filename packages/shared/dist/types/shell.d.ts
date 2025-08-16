export interface AppAssignment {
    appId: string;
}
export interface Frame {
    id: string;
    name: string;
    order: number;
    assignedApps: AppAssignment[];
}
export interface AppDefinition {
    id: string;
    name: string;
    scope: string;
    module: string;
    url?: string;
}
export interface ServiceEndpoints {
    jobConfigServiceUrl?: string;
}
export interface ShellConfigurationResponse {
    frames: Frame[];
    availableApps: AppDefinition[];
    serviceEndpoints: ServiceEndpoints;
}
export interface ShellPreferencesRequest {
    frames: Frame[];
}
