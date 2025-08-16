/**
 * Main entry point for shared package
 * Exports all shared types, utilities, components and services
 */
export * from './types/workorder';
export * from './types/job';
export * from './types/config';
export * from './config/configTypes';
export * from './config/remotes';
export { default as eventBus } from './utils/eventBus';
export { default as TimeAgo } from './components/TimeAgo';
export { default as DiffViewer } from './components/DiffViewer';
export { default as RemoteComponent } from './components/RemoteComponent';
export { apiService, api } from './services/apiService';
export { API_ENDPOINTS } from './config/api';
