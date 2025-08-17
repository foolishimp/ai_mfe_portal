/**
 * AI MFE Portal Shared Package
 * Main entry point for shared utilities, types, and services
 */
export * from './types/events';
export type { LayoutInfoResponse, LayoutDefinition, LayoutWindow, Frame, AppAssignment, ShellConfigurationResponse, ShellPreferencesRequest, AppDefinition, ServiceEndpoints, Preferences } from './types/shell';
export type * from './types/config';
export type * from './types/iframe';
export * from './utils/bootstrapHelper';
export * from './config/configTypes';
export * from './utils/mountHelper';
export { eventBus } from './utils/eventBus';
export { default as TimeAgo } from './components/TimeAgo';
export { default as DiffViewer } from './components/DiffViewer';
export { apiService, api, configureApiService, checkApiServiceReady } from './services/apiService';
export { API_ENDPOINTS } from './config/api';
