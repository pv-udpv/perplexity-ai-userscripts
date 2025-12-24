import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService } from './storage';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    // Clean localStorage before each test
    localStorage.clear();
    storageService = new StorageService({ namespace: 'test' });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('get/set', () => {
    it('should store and retrieve values', async () => {
      await storageService.set('key1', 'value1');
      const result = await storageService.get('key1');
      expect(result).toBe('value1');
    });

    it('should handle objects', async () => {
      const obj = { name: 'test', value: 42 };
      await storageService.set('obj', obj);
      const result = await storageService.get('obj');
      expect(result).toEqual(obj);
    });

    it('should handle arrays', async () => {
      const arr = [1, 2, 3, 'test'];
      await storageService.set('arr', arr);
      const result = await storageService.get('arr');
      expect(result).toEqual(arr);
    });

    it('should return null for non-existent keys', async () => {
      const result = await storageService.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should support generics for type safety', async () => {
      const config = { theme: 'dark' as const, fontSize: 14 };
      await storageService.set('config', config);
      const result = await storageService.get<typeof config>('config');
      expect(result?.theme).toBe('dark');
    });
  });

  describe('remove', () => {
    it('should remove stored values', async () => {
      await storageService.set('key1', 'value1');
      expect(await storageService.get('key1')).toBe('value1');

      await storageService.remove('key1');
      expect(await storageService.get('key1')).toBeNull();
    });

    it('should not throw when removing non-existent keys', async () => {
      await expect(storageService.remove('nonexistent')).resolves.toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all namespaced values', async () => {
      await storageService.set('key1', 'value1');
      await storageService.set('key2', 'value2');

      await storageService.clear();

      expect(await storageService.get('key1')).toBeNull();
      expect(await storageService.get('key2')).toBeNull();
    });

    it('should not clear other namespaces', async () => {
      const other = new StorageService({ namespace: 'other' });

      await storageService.set('key1', 'value1');
      await other.set('key1', 'other-value');

      await storageService.clear();

      expect(await storageService.get('key1')).toBeNull();
      expect(await other.get('key1')).toBe('other-value');
    });
  });

  describe('has', () => {
    it('should check if key exists', async () => {
      await storageService.set('key1', 'value1');
      expect(await storageService.has('key1')).toBe(true);
      expect(await storageService.has('nonexistent')).toBe(false);
    });
  });

  describe('keys', () => {
    it('should list all keys in namespace', async () => {
      await storageService.set('key1', 'value1');
      await storageService.set('key2', 'value2');

      const keys = await storageService.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys.length).toBeGreaterThanOrEqual(2);
    });

    it('should not include other namespaces', async () => {
      const other = new StorageService({ namespace: 'other' });

      await storageService.set('key1', 'value1');
      await other.set('key2', 'value2');

      const keys = await storageService.keys();
      expect(keys).toContain('key1');
      expect(keys).not.toContain('key2');
    });
  });

  describe('size', () => {
    it('should calculate storage size', async () => {
      await storageService.set('key1', 'short');
      const size1 = await storageService.size();
      expect(size1).toBeGreaterThan(0);

      await storageService.set('key2', 'a'.repeat(1000));
      const size2 = await storageService.size();
      expect(size2).toBeGreaterThan(size1);
    });
  });
});
