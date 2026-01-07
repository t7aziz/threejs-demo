type EventCallback = (data?: any) => void;

class EventBus {
    private listeners: Map<string, EventCallback[]> = new Map();

    on(event: string, callback: EventCallback): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    off(event: string, callback: EventCallback): void {
        const callbacks = this.listeners.get(event);
        if (!callbacks) return;
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    // USING ANY FOR DATA IS DUMB, THIS SHOULD USE GENERICS OR A TYPED EVENT MAP
    emit(event: string, data?: any): void {
        const callbacks = this.listeners.get(event);
        if (!callbacks) return;
        callbacks.forEach(callback => callback(data));
    }

    clear(): void {
        this.listeners.clear();
    }
}

export const eventBus = new EventBus();
