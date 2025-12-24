/**
 * Type-Safe Event System
 * Enables inter-module communication with compile-time type checking
 *
 * Pattern from: Complexity extension (pnd280/complexity)
 * Features:
 * - Type-safe event subscriptions
 * - Multiple listeners per event
 * - One-time listeners
 * - Error handling per listener
 * - Memory leak prevention
 */

/**
 * Event data types for all events in the application
 * Extend this interface to add new events
 */
export interface EventMap {
  // Core script events
  'script:initialized': {
    scriptName: string;
    version: string;
    timestamp: number;
  };
  'script:error': {
    scriptName: string;
    message: string;
    stack?: string;
    timestamp: number;
  };

  // Storage events
  'storage:changed': {
    key: string;
    value: unknown;
    oldValue: unknown;
    timestamp: number;
  };

  // Perplexity-specific events
  'perplexity:query-sent': {
    query: string;
    timestamp: number;
    model?: string;
  };
  'perplexity:response-received': {
    responseText: string;
    sources?: string[];
    timestamp: number;
  };
  'perplexity:error': {
    message: string;
    timestamp: number;
  };

  // UI events
  'ui:panel-toggled': {
    visible: boolean;
    timestamp: number;
  };
  'ui:theme-changed': {
    theme: 'light' | 'dark';
    timestamp: number;
  };
}

/**
 * Type for event listeners
 */
type EventListener<K extends keyof EventMap> = (data: EventMap[K]) => void;

/**
 * Type-safe event emitter
 * @example
 * const events = new EventEmitter();
 * events.emit('perplexity:query-sent', { query: 'What is AI?', timestamp: Date.now() });
 * events.on('perplexity:query-sent', (data) => console.log(data.query));
 */
export class EventEmitter {
  private listeners: Map<keyof EventMap, Set<EventListener<any>>> = new Map();
  private onceListeners: Map<keyof EventMap, Set<EventListener<any>>> = new Map();

  /**
   * Subscribe to an event
   * @param event - Event name (type-safe)
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   * @example
   * const unsubscribe = events.on('perplexity:query-sent', (data) => {
   *   console.log('Query:', data.query);
   * });
   *
   * // Later:
   * unsubscribe();
   */
  on<K extends keyof EventMap>(
    event: K,
    callback: EventListener<K>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listeners = this.listeners.get(event)!;
    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Subscribe to an event, fires only once
   * @param event - Event name
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   * @example
   * events.once('perplexity:response-received', (data) => {
   *   console.log('First response received');
   * });
   */
  once<K extends keyof EventMap>(
    event: K,
    callback: EventListener<K>
  ): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }

    const wrappedCallback = ((data: EventMap[K]) => {
      callback(data);
      // Remove after execution
      unsubscribe();
    }) as EventListener<K>;

    this.onceListeners.get(event)!.add(wrappedCallback);

    const unsubscribe = () => {
      this.onceListeners.get(event)?.delete(wrappedCallback);
    };

    return unsubscribe;
  }

  /**
   * Emit an event to all listeners
   * @param event - Event name
   * @param data - Event data (type-checked at compile time)
   * @example
   * events.emit('perplexity:query-sent', {
   *   query: 'What is AI?',
   *   timestamp: Date.now()
   * });
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    // Call regular listeners
    const regularListeners = this.listeners.get(event);
    if (regularListeners) {
      for (const callback of regularListeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventEmitter] Error in ${String(event)} handler:`, error);
        }
      }
    }

    // Call once listeners
    const onceListenersList = this.onceListeners.get(event);
    if (onceListenersList) {
      // Create copy to avoid modification during iteration
      const listeners = Array.from(onceListenersList);
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventEmitter] Error in ${String(event)} once handler:`, error);
        }
      }
      // Clear once listeners after execution
      this.onceListeners.delete(event);
    }
  }

  /**
   * Get number of listeners for an event
   * @param event - Event name
   * @returns Number of listeners
   */
  listenerCount<K extends keyof EventMap>(event: K): number {
    const regular = this.listeners.get(event)?.size ?? 0;
    const once = this.onceListeners.get(event)?.size ?? 0;
    return regular + once;
  }

  /**
   * Remove all listeners for an event
   * @param event - Event name (optional, clears all if not provided)
   * @example
   * events.removeAllListeners('perplexity:query-sent');
   * // or
   * events.removeAllListeners(); // Clears everything
   */
  removeAllListeners<K extends keyof EventMap>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Get all event names with active listeners
   * @returns Array of event names
   */
  eventNames(): (keyof EventMap)[] {
    const names = new Set<keyof EventMap>();
    for (const event of this.listeners.keys()) {
      names.add(event);
    }
    for (const event of this.onceListeners.keys()) {
      names.add(event);
    }
    return Array.from(names);
  }
}

/**
 * Singleton instance for global use
 */
export const events = new EventEmitter();
