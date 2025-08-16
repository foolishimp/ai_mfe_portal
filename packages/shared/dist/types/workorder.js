// File: c4h-editor-micro/packages/shared/src/types/workorder.ts
// Migrated from original frontend
// File: frontend/src/types/workorder.ts
/**
 * Type definitions for WorkOrder and related interfaces
 */
// Add the ParameterType enum that's referenced but missing
export var ParameterType;
(function (ParameterType) {
    ParameterType["STRING"] = "string";
    ParameterType["NUMBER"] = "number";
    ParameterType["BOOLEAN"] = "boolean";
    ParameterType["ARRAY"] = "array";
    ParameterType["OBJECT"] = "object";
})(ParameterType || (ParameterType = {}));
