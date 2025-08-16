import { AxiosRequestConfig } from 'axios';
import { JobListResponse, JobConfigReference } from '../types/job';
declare const axiosInstance: import("axios").AxiosInstance;
declare class ApiService {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    getConfigs(configType: string): Promise<any[]>;
    getConfig(configType: string, id: string): Promise<any>;
    private createEmptyConfig;
    createConfig(configType: string, data: any): Promise<any>;
    updateConfig(configType: string, id: string, data: any): Promise<any>;
    deleteConfig(configType: string, id: string, commitMessage?: string, author?: string): Promise<{
        message: string;
    }>;
    archiveConfig(configType: string, id: string, author?: string): Promise<{
        message: string;
    }>;
    unarchiveConfig(configType: string, id: string, author?: string): Promise<{
        message: string;
    }>;
    cloneConfig(configType: string, id: string, newId: string): Promise<any>;
    getConfigHistory(configType: string, id: string): Promise<{
        config_id: string;
        config_type: string;
        versions: Array<{
            version: string;
            commit_hash: string;
            created_at: string;
            author: string;
            message: string;
        }>;
    }>;
    getJobs(): Promise<JobListResponse>;
    getJob(id: string): Promise<any>;
    submitJob(params: {
        workorder: string;
        teamconfig: string;
        runtimeconfig: string;
        userId?: string;
        jobConfiguration?: Record<string, any>;
    }): Promise<any>;
    submitJobTuple(workorderId: string, teamconfigId: string, runtimeconfigId: string, userId?: string): Promise<any>;
    submitJobConfigs(configs: JobConfigReference[], userId?: string, jobConfiguration?: Record<string, any>): Promise<any>;
    cancelJob(id: string): Promise<any>;
    getJobHistory(id: string): Promise<any>;
}
export declare const apiService: ApiService;
export declare const api: import("axios").AxiosInstance;
export default axiosInstance;
