import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter, EventMap } from './events';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on/emit', () => {
    it('should call listener when event is emitted', () => {
      const callback = vi.fn();
      emitter.on('perplexity:query-sent', callback);

      emitter.emit('perplexity:query-sent', {
        query: 'test',
        timestamp: Date.now(),
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'test' })
      );
    });

    it('should call multiple listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      emitter.on('script:initialized', callback1);
      emitter.on('script:initialized', callback2);

      emitter.emit('script:initialized', {
        scriptName: 'test',
        version: '1.0.0',
        timestamp: Date.now(),
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should pass correct data to listener', () => {
      const callback = vi.fn();
      const data = {
        query: 'What is AI?',
        timestamp: 1234567890,
      };

      emitter.on('perplexity:query-sent', callback);
      emitter.emit('perplexity:query-sent', data);

      expect(callback).toHaveBeenCalledWith(data);
    });
  });

  describe('once', () => {
    it('should call listener only once', () => {
      const callback = vi.fn();
      emitter.once('perplexity:query-sent', callback);

      emitter.emit('perplexity:query-sent', {
        query: 'test1',
        timestamp: Date.now(),
      });
      emitter.emit('perplexity:query-sent', {
        query: 'test2',
        timestamp: Date.now(),
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not call regular listeners when once listener fires', () => {
      const onceCallback = vi.fn();
      const regularCallback = vi.fn();

      emitter.once('perplexity:query-sent', onceCallback);
      emitter.on('perplexity:query-sent', regularCallback);

      const data = { query: 'test', timestamp: Date.now() };
      emitter.emit('perplexity:query-sent', data);

      expect(onceCallback).toHaveBeenCalledTimes(1);
      expect(regularCallback).toHaveBeenCalledTimes(1);

      emitter.emit('perplexity:query-sent', data);

      expect(onceCallback).toHaveBeenCalledTimes(1);
      expect(regularCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from event', () => {
      const callback = vi.fn();
      const unsubscribe = emitter.on('perplexity:query-sent', callback);

      unsubscribe();

      emitter.emit('perplexity:query-sent', {
        query: 'test',
        timestamp: Date.now(),
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should return unsubscribe function from once', () => {
      const callback = vi.fn();
      const unsubscribe = emitter.once('perplexity:query-sent', callback);

      unsubscribe();

      emitter.emit('perplexity:query-sent', {
        query: 'test',
        timestamp: Date.now(),
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should not throw when listener throws', () => {
      const callback = vi.fn(() => {
        throw new Error('Test error');
      });
      const callback2 = vi.fn();

      emitter.on('perplexity:query-sent', callback);
      emitter.on('perplexity:query-sent', callback2);

      expect(() => {
        emitter.emit('perplexity:query-sent', {
          query: 'test',
          timestamp: Date.now(),
        });
      }).not.toThrow();

      expect(callback).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('should return correct listener count', () => {
      emitter.on('perplexity:query-sent', () => {});
      emitter.on('perplexity:query-sent', () => {});
      emitter.once('perplexity:query-sent', () => {});

      expect(emitter.listenerCount('perplexity:query-sent')).toBe(3);
    });

    it('should return 0 for event with no listeners', () => {
      expect(emitter.listenerCount('script:initialized')).toBe(0);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      const callback = vi.fn();

      emitter.on('perplexity:query-sent', callback);
      emitter.on('perplexity:query-sent', callback);
      emitter.removeAllListeners('perplexity:query-sent');

      emitter.emit('perplexity:query-sent', {
        query: 'test',
        timestamp: Date.now(),
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should remove all listeners when no event specified', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      emitter.on('perplexity:query-sent', callback1);
      emitter.on('script:initialized', callback2);
      emitter.removeAllListeners();

      emitter.emit('perplexity:query-sent', {
        query: 'test',
        timestamp: Date.now(),
      });
      emitter.emit('script:initialized', {
        scriptName: 'test',
        version: '1.0.0',
        timestamp: Date.now(),
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('eventNames', () => {
    it('should return all event names with listeners', () => {
      emitter.on('perplexity:query-sent', () => {});
      emitter.on('script:initialized', () => {});

      const names = emitter.eventNames();
      expect(names).toContain('perplexity:query-sent');
      expect(names).toContain('script:initialized');
    });

    it('should include once listeners', () => {
      emitter.once('perplexity:response-received', () => {});

      const names = emitter.eventNames();
      expect(names).toContain('perplexity:response-received');
    });
  });
});
