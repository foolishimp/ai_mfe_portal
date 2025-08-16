/**
 * /packages/shared/src/index.ts
 * Main entry point for shared package
 * Exports all shared types, utilities, components and services
 */
// Export types AND values from events.ts (needed for enum EventTypes)
export * from './types/events';
export * from './types/job'; // Already exports enum value correctly
// Export runtime utilities/values
export * from './utils/bootstrapHelper';
export * from './config/configTypes';
export * from './utils/mountHelper'; // Export mount helper utility
export { eventBus } from './utils/eventBus';
// Export shared components (runtime values)
export { default as TimeAgo } from './components/TimeAgo';
export { default as DiffViewer } from './components/DiffViewer';
// Export API service (runtime values) AND configuration function
export { apiService, api, configureApiService, checkApiServiceReady } from './services/apiService';
export { API_ENDPOINTS } from './config/api';
