/**
 * /packages/shared/src/types/events.ts
 * Standard event types for cross-microfrontend communication
 */
/**
 * Registry of standard event types and their expected payload structure
 * This enables better type checking and documentation
 */
export var EventTypes;
(function (EventTypes) {
    // Configuration events
    EventTypes["CONFIG_LOADED"] = "config:loaded";
    EventTypes["CONFIG_SAVED"] = "config:saved";
    EventTypes["CONFIG_DELETED"] = "config:deleted";
    EventTypes["CONFIG_LIST_UPDATED"] = "config:list-updated";
    EventTypes["SHELL_CONFIG_READY"] = "shell:config:ready";
    // Navigation events
    EventTypes["NAVIGATION_REQUEST"] = "navigation:request";
    // Job events
    EventTypes["JOB_SUBMITTED"] = "job:submitted";
    EventTypes["JOB_STATUS_CHANGED"] = "job:status-changed";
    EventTypes["JOB_LIST_UPDATED"] = "job:list-updated";
    // Notification events
    EventTypes["NOTIFICATION_SHOW"] = "notification:show";
    // Chat/AI-related events
    EventTypes["CHAT_SEND_MESSAGE"] = "chat:sendMessage";
    EventTypes["CHAT_PROVIDE_CONTEXT"] = "chat:provideContext";
    // Test events for development
    EventTypes["TEST_MESSAGE"] = "test:message";
    EventTypes["TEST_PING"] = "test:ping";
    EventTypes["TEST_MOUNTED"] = "test:mounted";
    EventTypes["TEST_UNMOUNTED"] = "test:unmounted";
})(EventTypes || (EventTypes = {}));
