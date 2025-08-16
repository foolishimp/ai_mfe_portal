/**
 * /packages/shared/src/types/shell.ts
 * Type definitions mirroring the Preferences Shell Service API models.
 */
export type MFEType = 'ESM' | 'WebComponent' | 'Iframe';
export interface AppAssignment {
    appId: string;
    windowId?: number;
}
export interface LayoutWindow {
    id: number;
    name: string;
    style: Record<string, any>;
}
export interface LayoutDefinition {
    id: string;
    name: string;
    description: string;
    containerStyle: Record<string, any>;
    windows: LayoutWindow[];
}
export interface Frame {
    id: string;
    name: string;
    order: number;
    layoutId?: string;
    assignedApps: AppAssignment[];
}
export interface FrameDefinition extends Frame {
}
export interface AppDefinition {
    id: string;
    name: string;
    type: MFEType;
    url: string;
    scope?: string;
    module?: string;
}
export interface Preferences {
    frames: Frame[];
    availableApps?: AppDefinition[];
}
export interface ServiceEndpoints {
    jobConfigServiceUrl?: string;
}
export interface ShellConfigurationResponse {
    preferences: Preferences;
    frames: Frame[];
    mainBackendUrl?: string;
    availableApps: AppDefinition[];
    layouts: LayoutDefinition[];
    serviceEndpoints: ServiceEndpoints;
}
export interface ShellPreferencesRequest {
    frames: Frame[];
}
export interface LayoutInfoResponse {
    id: string;
    name: string;
    description: string;
    window_count: number;
}
