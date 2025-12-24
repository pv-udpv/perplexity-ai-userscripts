import { describe, it, expect, beforeEach } from 'vitest';
import { debounce, throttle, sleep, querySafe, generateId } from '../utils';

describe('vitemonkey-built utilities', () => {
  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const fn = () => {
        callCount++;
      };
      const debounced = debounce(fn, 50);

      debounced();
      debounced();
      debounced();

      expect(callCount).toBe(0);

      await sleep(60);
      expect(callCount).toBe(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const fn = () => {
        callCount++;
      };
      const throttled = throttle(fn, 50);

      throttled();
      throttled();
      throttled();

      expect(callCount).toBe(1);

      await sleep(60);
      throttled();
      expect(callCount).toBe(2);
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });

  describe('querySafe', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div class="test">Content</div>';
    });

    it('should query element safely', () => {
      const el = querySafe<HTMLDivElement>('.test');
      expect(el).not.toBeNull();
      expect(el?.textContent).toBe('Content');
    });

    it('should return null for invalid selector', () => {
      const el = querySafe('[invalid');
      expect(el).toBeNull();
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test-/);
    });
  });
});
