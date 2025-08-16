// File: packages/shared/src/utils/eventBus.ts
/**
 * EventBus for cross-microfrontend communication
 * Provides a simple pub/sub mechanism for sharing events
 */
class EventBus {
    constructor() {
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        console.log(`EventBus: Subscribed to '${event}', total subscribers: ${this.events[event].length}`);
        // Return unsubscribe function
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
            console.log(`EventBus: Unsubscribed from '${event}', remaining subscribers: ${this.events[event].length}`);
        };
    }
    publish(event, data) {
        console.log(`EventBus: Publishing event '${event}'`, data);
        if (!this.events[event]) {
            console.log(`EventBus: No subscribers for event '${event}'`);
            return;
        }
        this.events[event].forEach(callback => {
            try {
                callback(data);
            }
            catch (error) {
                console.error(`EventBus: Error in subscriber callback for event '${event}'`, error);
            }
        });
    }
}
// Create singleton instance
const eventBus = new EventBus();
// Make available globally for cross-microfrontend communication
window.__C4H_EVENT_BUS__ = eventBus;
export default eventBus;
