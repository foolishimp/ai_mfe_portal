/**
 * Configuration Type Registry
 *
 * This file defines all supported configuration types and their metadata.
 * New configuration types can be added here without code changes.
 */
const configTypes = {
    workorder: {
        type: "workorder",
        name: "Work Order",
        description: "Defines what needs to be done and against which asset",
        supportsVersioning: true,
        requiredForJob: true,
        icon: "Description",
        apiEndpoints: {
            list: "/api/v1/configs/workorder",
            get: (id) => `/api/v1/configs/workorder/${id}`,
            create: "/api/v1/configs/workorder",
            update: (id) => `/api/v1/configs/workorder/${id}`,
            delete: (id) => `/api/v1/configs/workorder/${id}`,
            archive: (id) => `/api/v1/configs/workorder/${id}/archive`,
            unarchive: (id) => `/api/v1/configs/workorder/${id}/unarchive`,
            clone: (id) => `/api/v1/configs/workorder/${id}/clone`,
            history: (id) => `/api/v1/configs/workorder/${id}/history`,
            render: (id) => `/api/v1/configs/workorder/${id}/render`,
            test: (id) => `/api/v1/configs/workorder/${id}/test`
        },
        defaultContent: {
            template: {
                text: "",
                parameters: [],
                config: {
                    temperature: 0.7,
                    max_tokens: 1000,
                    stop_sequences: []
                }
            }
        }
    },
    teamconfig: {
        type: "teamconfig",
        name: "Team Configuration",
        description: "Defines the agent teams and their capabilities",
        supportsVersioning: true,
        requiredForJob: true,
        icon: "Group",
        apiEndpoints: {
            list: "/api/v1/configs/teamconfig",
            get: (id) => `/api/v1/configs/teamconfig/${id}`,
            create: "/api/v1/configs/teamconfig",
            update: (id) => `/api/v1/configs/teamconfig/${id}`,
            delete: (id) => `/api/v1/configs/teamconfig/${id}`,
            archive: (id) => `/api/v1/configs/teamconfig/${id}/archive`,
            unarchive: (id) => `/api/v1/configs/teamconfig/${id}/unarchive`,
            clone: (id) => `/api/v1/configs/teamconfig/${id}/clone`,
            history: (id) => `/api/v1/configs/teamconfig/${id}/history`
        },
        defaultContent: {
            roles: [
                {
                    name: "Default Role",
                    description: "Default role with basic capabilities",
                    capabilities: ["chat", "research"],
                    config: {}
                }
            ],
            teams: [],
            default_team: "",
            global_config: {
                llm_settings: {
                    default_model: "",
                    default_provider: ""
                }
            }
        }
    },
    runtimeconfig: {
        type: "runtimeconfig",
        name: "Runtime Configuration",
        description: "Manages operational aspects of the C4H Service",
        supportsVersioning: true,
        requiredForJob: true,
        icon: "Settings",
        apiEndpoints: {
            list: "/api/v1/configs/runtimeconfig",
            get: (id) => `/api/v1/configs/runtimeconfig/${id}`,
            create: "/api/v1/configs/runtimeconfig",
            update: (id) => `/api/v1/configs/runtimeconfig/${id}`,
            delete: (id) => `/api/v1/configs/runtimeconfig/${id}`,
            archive: (id) => `/api/v1/configs/runtimeconfig/${id}/archive`,
            unarchive: (id) => `/api/v1/configs/runtimeconfig/${id}/unarchive`,
            clone: (id) => `/api/v1/configs/runtimeconfig/${id}/clone`,
            history: (id) => `/api/v1/configs/runtimeconfig/${id}/history`
        },
        defaultContent: {
            lineage: {
                enabled: true,
                namespace: "default"
            },
            logging: {
                level: "info",
                format: "json"
            },
            backup: {
                enabled: true,
                path: "./backups"
            }
        }
    },
};
// Backward compatibility with existing API endpoints
const backwardCompatibilityAliases = {
    workorders: "workorder",
    teamconfigs: "teamconfig",
    runtimeconfigs: "runtimeconfig"
};
// Export the config types registry
export { configTypes, backwardCompatibilityAliases };
export default configTypes;
