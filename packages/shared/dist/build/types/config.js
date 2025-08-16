/**
 * Generic Configuration types
 */
// WorkOrder specific types for backward compatibility
export var EditorTab;
(function (EditorTab) {
    EditorTab["INTENT"] = "intent";
    EditorTab["SYSTEM"] = "system";
})(EditorTab || (EditorTab = {}));
// Export config section types for backward compatibility
export var ConfigSection;
(function (ConfigSection) {
    ConfigSection["PROJECT"] = "project";
    ConfigSection["INTENT"] = "intent";
    ConfigSection["LLM_CONFIG"] = "llm_config";
    ConfigSection["ORCHESTRATION"] = "orchestration";
    ConfigSection["RUNTIME"] = "runtime";
    ConfigSection["BACKUP"] = "backup";
    ConfigSection["LOGGING"] = "logging";
})(ConfigSection || (ConfigSection = {}));
