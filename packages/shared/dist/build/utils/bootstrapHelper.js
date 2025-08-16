/**
 * /packages/shared/src/utils/bootstrapHelper.ts
 * Utility for MFE self-initialization and configuration
 */
import axios from 'axios';
import { configureApiService } from '../services/apiService';
/**
 * Get shell service URL from globals
 */
export function getShellServiceUrl() {
    // Type assertion for window global property
    return window.__C4H_SHELL_SERVICE_URL__;
}
/**
 * Bootstrap MFE by loading configuration from the shell service
 * and configuring required services. This should be called by each MFE on mount.
 *
 * @param mfeId Identifier for the MFE (for logging)
 * @returns Promise with bootstrap result
 */
export async function bootstrapConfig(mfeId) {
    console.log(`[${mfeId}] Attempting bootstrap...`);
    const shellServiceUrl = getShellServiceUrl();
    if (!shellServiceUrl) {
        console.error(`[${mfeId}] Bootstrap failed: Shell service URL not found on window!`);
        return { success: false, error: "Shell service URL not found" };
    }
    try {
        console.log(`[${mfeId}] Bootstrapping: Fetching config from ${shellServiceUrl}...`);
        // Use axios directly as apiService might not be configured yet for this MFE instance
        const response = await axios.get(`${shellServiceUrl}/api/v1/shell/configuration`);
        const config = response.data;
        if (config?.serviceEndpoints?.jobConfigServiceUrl) {
            // This configures the apiService instance specific to the calling MFE's context/bundle
            configureApiService(config.serviceEndpoints.jobConfigServiceUrl);
            console.log(`[${mfeId}] Bootstrap successful: apiService configured with endpoint: ${config.serviceEndpoints.jobConfigServiceUrl}`);
            return { success: true, config };
        }
        else {
            console.error(`[${mfeId}] Bootstrap failed: Config response missing required serviceEndpoints.jobConfigServiceUrl`);
            throw new Error("Configuration response missing required service endpoint URL");
        }
    }
    catch (error) {
        console.error(`[${mfeId}] Bootstrap failed:`, error.response?.data || error.message || error);
        return { success: false, error: error.response?.data || error.message || error };
    }
}
