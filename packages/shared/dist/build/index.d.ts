/**
 * /packages/shared/src/index.ts
 * Main entry point for shared package
 * Exports all shared types, utilities, components and services
 */
export * from './types/events';
export type { LayoutInfoResponse, LayoutDefinition, LayoutWindow, Frame, AppAssignment, ShellConfigurationResponse, ShellPreferencesRequest, AppDefinition, ServiceEndpoints, Preferences, MFEType } from './types/shell';
export type * from './types/shell';
export type * from './types/workorder';
export type * from './types/config';
export * from './types/job';
export type * from './types/iframe';
export * from './utils/bootstrapHelper';
export * from './config/configTypes';
export * from './utils/mountHelper';
export { eventBus } from './utils/eventBus';
export { default as TimeAgo } from './components/TimeAgo';
export { default as DiffViewer } from './components/DiffViewer';
export { apiService, api, configureApiService, checkApiServiceReady } from './services/apiService';
export { API_ENDPOINTS } from './config/api';
