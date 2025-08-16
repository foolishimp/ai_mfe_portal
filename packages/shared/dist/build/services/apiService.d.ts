/**
 * /packages/shared/src/services/apiService.ts
 * Centralized API service for making requests to backend services
 * --- MODIFIED: Added checkApiServiceReady function ---
 */
import { AxiosRequestConfig } from 'axios';
import { Job, JobConfigReference } from '../types/job';
import { Config } from '../types/config';
import { ShellPreferencesRequest } from '../types/shell';
declare const axiosInstance: import("axios").AxiosInstance;
export declare const configureApiService: (baseUrl: string | undefined) => void;
/**
 * Checks if the apiService has been configured with a base URL.
 * This is typically done by the shell application after fetching initial configuration.
 * @returns {boolean} True if the API service is considered ready, false otherwise.
 */
export declare const checkApiServiceReady: () => boolean;
declare class ApiService {
    private get;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    private delete;
    getConfigs(configType: string): Promise<any[]>;
    getConfig(configType: string, id: string): Promise<Config>;
    private createEmptyConfig;
    createConfig(configType: string, data: Config, commitMessage?: string, author?: string): Promise<Config>;
    updateConfig(configType: string, id: string, data: Config, commitMessage?: string, author?: string): Promise<Config>;
    deleteConfig(configType: string, id: string, commitMessage?: string, author?: string): Promise<{
        message: string;
    }>;
    archiveConfig(configType: string, id: string, author?: string): Promise<{
        message: string;
    }>;
    unarchiveConfig(configType: string, id: string, author?: string): Promise<{
        message: string;
    }>;
    cloneConfig(configType: string, id: string, newId: string): Promise<Config>;
    getConfigHistory(configType: string, id: string): Promise<any>;
    getJobs(): Promise<any>;
    getJob(id: string): Promise<Job>;
    submitJob(params: {
        workorder: string;
        teamconfig: string;
        runtimeconfig: string;
        userId?: string;
        jobConfiguration?: Record<string, any>;
    }): Promise<Job>;
    submitJobConfigs(configs: JobConfigReference[], userId?: string, jobConfiguration?: Record<string, any>): Promise<Job>;
    cancelJob(id: string): Promise<Job>;
    getJobHistory(id: string): Promise<any>;
    saveShellPreferences(preferences: ShellPreferencesRequest): Promise<{
        message: string;
    }>;
}
export declare const apiService: ApiService;
export declare const api: import("axios").AxiosInstance;
export default axiosInstance;
