// File: packages/shared/src/config/api.ts
import axios from 'axios';
// Use process.env for Node.js environment compatibility
// TypeScript doesn't recognize import.meta.env by default
const API_BASE_URL = typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL
    ? process.env.VITE_API_BASE_URL
    : 'http://localhost:8000';
// Create an axios instance with the base URL
export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});
// API endpoints
export const API_ENDPOINTS = {
    // Config types endpoint
    CONFIG_TYPES: '/api/v1/config-types',
    // Config endpoints (generic)
    CONFIGS: (type) => `/api/v1/configs/${type}`,
    CONFIG: (type, id) => `/api/v1/configs/${type}/${id}`,
    CONFIG_HISTORY: (type, id) => `/api/v1/configs/${type}/${id}/history`,
    CONFIG_CLONE: (type, id) => `/api/v1/configs/${type}/${id}/clone`,
    CONFIG_ARCHIVE: (type, id) => `/api/v1/configs/${type}/${id}/archive`,
    CONFIG_UNARCHIVE: (type, id) => `/api/v1/configs/${type}/${id}/unarchive`,
    // Job endpoints
    JOBS: '/api/v1/jobs',
    JOB: (id) => `/api/v1/jobs/${id}`,
    JOB_CANCEL: (id) => `/api/v1/jobs/${id}/cancel`,
    // Legacy endpoints for backward compatibility
    WORKORDERS: '/api/v1/workorders',
    WORKORDER: (id) => `/api/v1/workorders/${id}`,
    WORKORDER_HISTORY: (id) => `/api/v1/workorders/${id}/history`,
    WORKORDER_CLONE: (id) => `/api/v1/workorders/${id}/clone`,
    WORKORDER_ARCHIVE: (id) => `/api/v1/workorders/${id}/archive`,
    WORKORDER_UNARCHIVE: (id) => `/api/v1/workorders/${id}/unarchive`,
    WORKORDER_RENDER: (id) => `/api/v1/workorders/${id}/render`,
    WORKORDER_TEST: (id) => `/api/v1/workorders/${id}/test`
};
// Export default api instance
export default api;
