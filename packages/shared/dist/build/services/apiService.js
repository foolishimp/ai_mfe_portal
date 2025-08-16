/**
 * /packages/shared/src/services/apiService.ts
 * Centralized API service for making requests to backend services
 * --- MODIFIED: Added checkApiServiceReady function ---
 */
import axios from 'axios';
import { configTypes } from '../config/configTypes';
// --- Base URL Handling ---
// Start with a default URL - will be configured by the shell
const API_BASE_URL = 'http://localhost:8000'; // Default base URL
// Internal state to track if the service has been configured
let isApiConfigured = false;
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});
// --- Dynamic Configuration Function ---
export const configureApiService = (baseUrl) => {
    const finalBaseUrl = baseUrl || API_BASE_URL;
    console.log(`apiService: configureApiService CALLED with: ${baseUrl}. Setting base URL to: ${finalBaseUrl}`);
    // Always set regardless of previous value to ensure consistency across MFEs
    axiosInstance.defaults.baseURL = finalBaseUrl;
    isApiConfigured = true; // Mark as configured
    console.log(`apiService: Successfully configured with baseURL: ${finalBaseUrl}`);
};
// --- NEW: Function to check readiness ---
/**
 * Checks if the apiService has been configured with a base URL.
 * This is typically done by the shell application after fetching initial configuration.
 * @returns {boolean} True if the API service is considered ready, false otherwise.
 */
export const checkApiServiceReady = () => {
    // Simple check: has configureApiService been successfully called?
    // You could add more sophisticated checks if needed (e.g., pinging an endpoint).
    const ready = isApiConfigured;
    console.log(`apiService: checkApiServiceReady() called. Returning: ${ready}`);
    return ready;
};
// --- END NEW FUNCTION ---
// --- Interceptor ---
axiosInstance.interceptors.response.use((response) => response, (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
});
// --- ApiService Class ---
class ApiService {
    async get(url, config) {
        const response = await axiosInstance.get(url, config);
        return response.data;
    }
    async post(url, data, config) {
        const response = await axiosInstance.post(url, data, config);
        return response.data;
    }
    async put(url, data, config) {
        const response = await axiosInstance.put(url, data, config);
        return response.data;
    }
    async delete(url, config) {
        const response = await axiosInstance.delete(url, config);
        return response.data;
    }
    // --- Public Methods ---
    async getConfigs(configType) {
        const endpoint = configTypes[configType]?.apiEndpoints.list;
        if (!endpoint)
            throw new Error(`Unknown config type: ${configType}`);
        console.log(`API: Fetching configs for type: ${configType} from ${endpoint}`);
        const response = await this.get(endpoint);
        console.log(`API: Received ${response.length} configs from server`);
        return response;
    }
    async getConfig(configType, id) {
        const endpoint = configTypes[configType]?.apiEndpoints.get(id);
        if (!endpoint)
            throw new Error(`Unknown config type: ${configType}`);
        if (id === 'new' || id === '') {
            console.log(`API: Creating new empty config of type ${configType}`);
            return this.createEmptyConfig(configType, '');
        }
        console.log(`API: Fetching config ${id} of type ${configType} from ${endpoint}`);
        try {
            return this.get(endpoint);
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log(`Config ${id} not found, creating new with this ID`);
                return this.createEmptyConfig(configType, id);
            }
            throw error;
        }
    }
    createEmptyConfig(configType, id) {
        const defaultContent = configTypes[configType]?.defaultContent || {};
        console.log(`API: Creating empty config of type ${configType} with ID ${id || 'empty'}`);
        return {
            id: id,
            content: defaultContent,
            metadata: {
                description: "",
                author: "Current User",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tags: [],
                version: "1.0.0",
                archived: false
            },
            config_type: configType,
            lineage: []
        };
    }
    async createConfig(configType, data, commitMessage, author) {
        const endpoint = configTypes[configType]?.apiEndpoints.create;
        if (!endpoint)
            throw new Error(`Unknown config type: ${configType}`);
        console.log(`API: Creating config of type ${configType} with ID ${data.id} at ${endpoint}`);
        const requestData = {
            id: data.id,
            content: data.content,
            metadata: data.metadata,
            commit_message: commitMessage || `Create new ${configType} ${data.id}`,
            author: author || data.metadata?.author || "Current User"
        };
        console.debug(`API: Submitting config create request:`, {
            id: data.id, endpoint, description: data.metadata?.description
        });
        try {
            return await this.post(endpoint, requestData);
        }
        catch (error) {
            if (error.response?.status === 409) {
                console.log(`Config with ID ${data.id} already exists, updating instead`);
                return this.updateConfig(configType, data.id, data, requestData.commit_message, requestData.author);
            }
            throw error;
        }
    }
    async updateConfig(configType, id, data, commitMessage, author) {
        const endpoint = configTypes[configType]?.apiEndpoints.update(id);
        if (!endpoint)
            throw new Error(`Unknown config type: ${configType}`);
        console.log(`API: Updating config ${id} of type ${configType} at ${endpoint}`);
        const requestData = {
            content: data.content,
            metadata: data.metadata,
            commit_message: commitMessage || `Update ${configType} ${id}`,
            author: author || data.metadata?.author || "Current User"
        };
        console.debug(`API: Submitting config update request:`, {
            id, endpoint, description: data.metadata?.description
        });
        try {
            return await this.put(endpoint, requestData);
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log(`Config ${id} not found, cannot update.`);
                throw new Error(`Configuration with ID ${id} not found for update.`);
            }
            throw error;
        }
    }
    async deleteConfig(configType, id, commitMessage = "Deleted via UI", author = "Current User") {
        const endpoint = configTypes[configType]?.apiEndpoints.delete(id);
        if (!endpoint)
            throw new Error(`Unknown config type: ${configType}`);
        console.log(`API: Deleting config ${id} of type ${configType} at ${endpoint}`);
        return this.delete(endpoint, {
            params: {
                commit_message: commitMessage,
                author
            }
        });
    }
    async archiveConfig(configType, id, author = "Current User") {
        const endpoint = configTypes[configType]?.apiEndpoints.archive(id);
        if (!endpoint)
            throw new Error(`Unknown config type: ${configType}`);
        console.log(`API: Archiving config ${id} of type ${configType} at ${endpoint}`);
        return this.post(endpoint, {}, { params: { author } });
    }
    async unarchiveConfig(configType, id, author = "Current User") {
        const endpoint = configTypes[configType]?.apiEndpoints.unarchive(id);
        if (!endpoint)
            throw new Error(`Unknown config type: ${configType}`);
        console.log(`API: Unarchiving config ${id} of type ${configType} at ${endpoint}`);
        return this.post(endpoint, {}, { params: { author } });
    }
    async cloneConfig(configType, id, newId) {
        const endpoint = configTypes[configType]?.apiEndpoints.clone(id);
        if (!endpoint)
            throw new Error(`Unknown config type: ${configType}`);
        console.log(`API: Cloning config ${id} of type ${configType} to ${newId} at ${endpoint}`);
        return this.post(endpoint, {}, { params: { new_id: newId, author: "Current User" } });
    }
    async getConfigHistory(configType, id) {
        const endpoint = configTypes[configType]?.apiEndpoints.history(id);
        if (!endpoint)
            throw new Error(`Unknown config type: ${configType}`);
        console.log(`API: Fetching history for config ${id} of type ${configType} at ${endpoint}`);
        return this.get(endpoint);
    }
    // Job API methods
    async getJobs() {
        console.log('API: Fetching all jobs from /api/v1/jobs');
        try {
            const response = await this.get('/api/v1/jobs');
            console.log(`API: Received ${response.items?.length || 0} jobs`);
            return response;
        }
        catch (error) {
            console.error('Error fetching jobs:', error);
            throw error;
        }
    }
    async getJob(id) {
        console.log(`API: Fetching job ${id} from /api/v1/jobs/${id}`);
        try {
            const response = await this.get(`/api/v1/jobs/${id}`);
            console.log(`API: Received job details for ${id}`);
            return response;
        }
        catch (error) {
            console.error(`Error fetching job ${id}:`, error);
            throw error;
        }
    }
    async submitJob(params) {
        console.log('API: Submitting job with configs:', params);
        const requestData = {
            workorder: { id: params.workorder, version: "latest", config_type: "workorder" },
            team: { id: params.teamconfig, version: "latest", config_type: "teamconfig" },
            runtime: { id: params.runtimeconfig, version: "latest", config_type: "runtimeconfig" },
            user_id: params.userId || 'current-user',
            job_configuration: params.jobConfiguration || { max_runtime: 3600, notify_on_completion: true }
        };
        return this.post('/api/v1/jobs', requestData);
    }
    async submitJobConfigs(configs, userId, jobConfiguration) {
        console.log('API: Submitting job with configurations list:', configs);
        if (!configs || configs.length === 0) {
            throw new Error('At least one configuration must be provided');
        }
        const configurations = configs.map(config => ({
            ...config,
            version: config.version || 'latest'
        }));
        const requestData = {
            configurations,
            user_id: userId || 'current-user',
            job_configuration: jobConfiguration || { max_runtime: 3600, notify_on_completion: true }
        };
        return this.post('/api/v1/jobs/multi-config', requestData);
    }
    async cancelJob(id) {
        console.log(`API: Cancelling job ${id}`);
        return this.post(`/api/v1/jobs/${id}/cancel`, {});
    }
    async getJobHistory(id) {
        console.log(`API: Fetching history for job ${id}`);
        return this.get(`/api/v1/jobs/${id}/history`);
    }
    // Shell Preferences API
    async saveShellPreferences(preferences) {
        // Use the preferences service URL directly here if needed, or assume baseURL is set correctly
        // For now, assuming the baseURL is correctly set by the shell context
        return this.put('/api/v1/shell/preferences', preferences);
    }
}
// Create and export a singleton instance
export const apiService = new ApiService();
// Export the axios instance as well
export const api = axiosInstance;
// Export as default for backward compatibility
export default axiosInstance;
