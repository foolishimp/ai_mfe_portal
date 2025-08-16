/**
 * /packages/shared/src/utils/eventBus.ts
 * EventBus for cross-microfrontend communication
 * Provides a centralized pub/sub mechanism using the browser's native EventTarget
 */
import { EventDetail } from '../types/events';
/**
 * EventBus class that extends the browser's built-in EventTarget
 * for standardized event handling across microfrontends
 */
declare class EventBus extends EventTarget {
    private static instance;
    /**
     * Get the singleton instance of EventBus
     */
    static getInstance(): EventBus;
    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor();
    /**
     * Publish an event to all subscribers
     * @param eventType Event type to publish
     * @param detail Event details to send
     */
    publish<T = any>(eventType: string, detail: EventDetail<T>): void;
    /**
     * Subscribe to an event
     * @param eventType Event type to subscribe to
     * @param callback Callback function to execute when event occurs
     * @returns Unsubscribe function
     */
    subscribe<T = any>(eventType: string, callback: (detail: EventDetail<T>) => void): () => void;
}
export declare const eventBus: EventBus;
export default eventBus;
