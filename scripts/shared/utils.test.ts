import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  debounce,
  throttle,
  sleep,
  retryWithBackoff,
  querySafe,
  querySafeAll,
  isElementInViewport,
  generateId,
} from './utils';

describe('Utils', () => {
  describe('debounce', () => {
    it('should delay execution until silence', async () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 100);

      debounced('first');
      debounced('second');
      debounced('third');

      // Not called yet
      expect(callback).not.toHaveBeenCalled();

      // Wait for debounce
      await sleep(150);

      // Called once with last value
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('third');
    });

    it('should reset on new call during wait', async () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 100);

      debounced('first');
      await sleep(50);
      debounced('second');
      await sleep(150);

      // Called with 'second'
      expect(callback).toHaveBeenCalledWith('second');
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should limit execution frequency', async () => {
      const callback = vi.fn();
      const throttled = throttle(callback, 100);

      throttled('call1');
      throttled('call2');
      throttled('call3');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('call1');

      await sleep(150);

      throttled('call4');
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith('call4');
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(95);
      expect(elapsed).toBeLessThan(150);
    });
  });

  describe('retryWithBackoff', () => {
    it('should retry on failure', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) throw new Error('Not ready');
        return 'success';
      };

      const result = await retryWithBackoff(fn, 5, 10);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw after max attempts', async () => {
      const fn = async () => {
        throw new Error('Always fails');
      };

      await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('Always fails');
    });

    it('should use exponential backoff', async () => {
      const timestamps: number[] = [];
      const fn = async () => {
        timestamps.push(Date.now());
        if (timestamps.length < 3) throw new Error('Retry');
      };

      await retryWithBackoff(fn, 3, 30);

      const delay1 = timestamps[1] - timestamps[0];
      const delay2 = timestamps[2] - timestamps[1];

      // delay2 should be roughly 2x delay1
      expect(delay2).toBeGreaterThan(delay1);
    });
  });

  describe('querySafe', () => {
    it('should query element safely', () => {
      const div = document.createElement('div');
      div.className = 'test';
      document.body.appendChild(div);

      const result = querySafe<HTMLDivElement>('.test');
      expect(result).toBe(div);

      document.body.removeChild(div);
    });

    it('should return null for invalid selector', () => {
      const result = querySafe('..invalid');
      expect(result).toBeNull();
    });

    it('should return null when element not found', () => {
      const result = querySafe('.nonexistent');
      expect(result).toBeNull();
    });

    it('should search within parent', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      child.className = 'inner';
      parent.appendChild(child);
      document.body.appendChild(parent);

      const result = querySafe<HTMLSpanElement>('.inner', parent);
      expect(result).toBe(child);

      document.body.removeChild(parent);
    });
  });

  describe('querySafeAll', () => {
    it('should query all elements safely', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.className = 'test';
      div2.className = 'test';
      document.body.appendChild(div1);
      document.body.appendChild(div2);

      const results = querySafeAll<HTMLDivElement>('.test');
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results).toContain(div1);
      expect(results).toContain(div2);

      document.body.removeChild(div1);
      document.body.removeChild(div2);
    });

    it('should return empty array for invalid selector', () => {
      const results = querySafeAll('..invalid');
      expect(results).toEqual([]);
    });

    it('should return empty array when no elements found', () => {
      const results = querySafeAll('.nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('isElementInViewport', () => {
    it('should detect visible element', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      const isVisible = isElementInViewport(div);
      expect(isVisible).toBe(true);

      document.body.removeChild(div);
    });

    it('should detect off-screen element', () => {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.top = '5000px';
      document.body.appendChild(div);

      const isVisible = isElementInViewport(div);
      expect(isVisible).toBe(false);

      document.body.removeChild(div);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^\d+-\w+$/);
    });

    it('should include prefix', () => {
      const id = generateId('test');

      expect(id).toMatch(/^test-\d+-\w+$/);
    });

    it('should generate different IDs on each call', () => {
      const ids = new Set(Array.from({ length: 10 }, () => generateId('test')));
      expect(ids.size).toBe(10);
    });
  });
});
