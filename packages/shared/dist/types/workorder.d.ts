/**
 * Type definitions for WorkOrder and related interfaces
 */
export declare enum ParameterType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    ARRAY = "array",
    OBJECT = "object"
}
export interface WorkOrderParameter {
    name: string;
    type: ParameterType;
    description?: string;
    required: boolean;
    default?: any;
}
export interface WorkOrderMetadata {
    author: string;
    archived?: boolean;
    created_at: string;
    updated_at: string;
    description?: string;
    tags: string[];
    version: string;
    goal?: string;
    priority?: string;
    due_date?: string | null;
    assignee?: string;
    asset?: string;
    target_model?: string;
    intent?: string | null;
}
export interface WorkOrderConfig {
    temperature: number;
    max_tokens?: number;
    top_p?: number | null;
    frequency_penalty?: number | null;
    presence_penalty?: number | null;
    stop_sequences: string[];
    service_id?: string | null;
    workflow_id?: string | null;
    max_runtime?: number | null;
    notify_on_completion?: boolean;
    parameters?: Record<string, any>;
}
export interface WorkOrderTemplate {
    text: string;
    parameters: WorkOrderParameter[];
    config: WorkOrderConfig;
}
export interface WorkOrder {
    id: string;
    template: WorkOrderTemplate;
    metadata: WorkOrderMetadata;
    parent_id?: string;
    lineage: string[];
}
export interface WorkOrderVersionInfo {
    version: string;
    commit_hash: string;
    created_at: string;
    author: string;
    message: string;
}
export interface WorkOrderHistoryResponse {
    workorder_id: string;
    versions: WorkOrderVersionInfo[];
}
export interface WorkOrderConfig {
    temperature: number;
    max_tokens?: number;
    top_p?: number | null;
    frequency_penalty?: number | null;
    presence_penalty?: number | null;
    stop_sequences: string[];
    service_id?: string | null;
    workflow_id?: string | null;
    max_runtime?: number | null;
    notify_on_completion?: boolean;
    parameters?: Record<string, any>;
    providers?: Record<string, any>;
    backup?: Record<string, any>;
    logging?: Record<string, any>;
    project?: Record<string, any>;
    [key: string]: any;
}
