/**
 * /packages/shared/src/utils/eventBus.ts
 * EventBus for cross-microfrontend communication
 * Provides a centralized pub/sub mechanism using the browser's native EventTarget
 */
/**
 * EventBus class that extends the browser's built-in EventTarget
 * for standardized event handling across microfrontends
 */
class EventBus extends EventTarget {
    /**
     * Get the singleton instance of EventBus
     */
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    /**
     * Private constructor to enforce singleton pattern
     */
    constructor() {
        super();
        console.log('EventBus: Created new instance');
    }
    /**
     * Publish an event to all subscribers
     * @param eventType Event type to publish
     * @param detail Event details to send
     */
    publish(eventType, detail) {
        console.log(`EventBus: Publishing ${eventType}`, detail);
        this.dispatchEvent(new CustomEvent(eventType, { detail }));
    }
    /**
     * Subscribe to an event
     * @param eventType Event type to subscribe to
     * @param callback Callback function to execute when event occurs
     * @returns Unsubscribe function
     */
    subscribe(eventType, callback) {
        const wrappedCallback = (event) => {
            if (event instanceof CustomEvent) {
                callback(event.detail);
            }
        };
        this.addEventListener(eventType, wrappedCallback);
        console.log(`EventBus: Subscribed to ${eventType}`);
        // Return unsubscribe function
        return () => {
            this.removeEventListener(eventType, wrappedCallback);
            console.log(`EventBus: Unsubscribed from ${eventType}`);
        };
    }
}
// Export singleton instance
export const eventBus = EventBus.getInstance();
// Also export as default for backward compatibility
export default eventBus;
