/**
 * AI MFE Portal Shared Package
 * Main entry point for shared utilities, types, and services
 */

// Export types AND values from events.ts (needed for enum EventTypes)
export * from './types/events';

// Export specific types from shell module
export type { 
  LayoutInfoResponse, 
  LayoutDefinition, 
  LayoutWindow, 
  Frame, 
  AppAssignment, 
  ShellConfigurationResponse, 
  ShellPreferencesRequest, 
  AppDefinition, 
  ServiceEndpoints, 
  Preferences 
} from './types/shell';

export type * from './types/config';
export type * from './types/iframe';

// Export runtime utilities/values
export * from './utils/bootstrapHelper';
export * from './config/configTypes';
export * from './utils/mountHelper';
export { eventBus } from './utils/eventBus';

// Export shared components (runtime values)
export { default as TimeAgo } from './components/TimeAgo';
export { default as DiffViewer } from './components/DiffViewer';

// Export API service (runtime values) AND configuration function
export { apiService, api, configureApiService, checkApiServiceReady } from './services/apiService';
export { API_ENDPOINTS } from './config/api';