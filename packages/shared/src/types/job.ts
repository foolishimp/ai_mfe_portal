/**
 * Job-related types for the AI MFE Portal shared package
 */

export interface Job {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    config?: JobConfigReference;
}

export interface JobConfigReference {
    id: string;
    version: string;
    url?: string;
}

export interface JobExecutionResult {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
}

export interface JobRequest {
    name: string;
    config: JobConfigReference;
    parameters?: Record<string, any>;
}

export interface JobStatus {
    id: string;
    status: Job['status'];
    progress?: number;
    message?: string;
    result?: JobExecutionResult;
}