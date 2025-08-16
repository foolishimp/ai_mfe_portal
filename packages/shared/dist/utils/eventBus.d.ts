/**
 * EventBus for cross-microfrontend communication
 * Provides a simple pub/sub mechanism for sharing events
 */
type EventCallback = (data: any) => void;
declare class EventBus {
    private events;
    subscribe(event: string, callback: EventCallback): () => void;
    publish(event: string, data: any): void;
}
declare const eventBus: EventBus;
export default eventBus;
