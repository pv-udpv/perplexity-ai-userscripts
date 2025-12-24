/**
 * Unified Storage Service
 * Abstracts GM_setValue/GM_getValue with localStorage fallback
 *
 * Pattern from: Complexity extension (pnd280/complexity)
 * Handles:
 * - Tampermonkey: GM_setValue, GM_getValue, GM_deleteValue, GM_listValues
 * - Violentmonkey: localStorage fallback
 * - Graceful error handling
 * - Type-safe with TypeScript generics
 */

export interface StorageOptions {
  namespace?: string;
}

export class StorageService {
  private namespace: string;
  private isGMAvailable: boolean;

  constructor(options: StorageOptions = {}) {
    this.namespace = options.namespace || 'pplx-userscript';
    this.isGMAvailable = typeof GM_getValue !== 'undefined';
  }

  /**
   * Get value from storage (prefers GM_getValue, falls back to localStorage)
   * @param key - Storage key (without namespace prefix)
   * @returns Parsed value or null if not found
   * @example
   * const theme = await storage.get<'light' | 'dark'>('theme');
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);

    // Try Tampermonkey API first
    if (this.isGMAvailable) {
      try {
        const value = GM_getValue(fullKey, null);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.warn(`[StorageService] Failed to get "${key}" from GM_getValue:`, error);
      }
    }

    // Fallback to localStorage
    try {
      const value = localStorage.getItem(fullKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`[StorageService] Failed to get "${key}" from localStorage:`, error);
      return null;
    }
  }

  /**
   * Set value in storage (prefers GM_setValue, falls back to localStorage)
   * @param key - Storage key (without namespace prefix)
   * @param value - Value to store (will be JSON serialized)
   * @example
   * await storage.set('config', { theme: 'dark', fontSize: 14 });
   */
  async set<T = unknown>(key: string, value: T): Promise<void> {
    const fullKey = this.getFullKey(key);
    const serialized = JSON.stringify(value);

    // Try Tampermonkey API first
    if (this.isGMAvailable) {
      try {
        GM_setValue(fullKey, serialized);
        return;
      } catch (error) {
        console.warn(`[StorageService] Failed to set "${key}" in GM_setValue:`, error);
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(fullKey, serialized);
    } catch (error) {
      console.error(`[StorageService] Failed to set "${key}" in localStorage:`, error);
    }
  }

  /**
   * Remove value from storage
   * @param key - Storage key to remove
   * @example
   * await storage.remove('temp-data');
   */
  async remove(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);

    // Remove from GM storage
    if (this.isGMAvailable) {
      try {
        if (typeof GM_deleteValue !== 'undefined') {
          GM_deleteValue(fullKey);
        }
      } catch (error) {
        console.warn(`[StorageService] Failed to delete "${key}" from GM:`, error);
      }
    }

    // Remove from localStorage
    try {
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`[StorageService] Failed to delete "${key}" from localStorage:`, error);
    }
  }

  /**
   * Clear all namespaced values from storage
   * @example
   * await storage.clear(); // Clears only pplx-userscript:* keys
   */
  async clear(): Promise<void> {
    // Clear from GM storage
    if (this.isGMAvailable) {
      try {
        if (typeof GM_listValues !== 'undefined') {
          const keys = GM_listValues();
          for (const key of keys) {
            if (key.startsWith(this.namespace)) {
              if (typeof GM_deleteValue !== 'undefined') {
                GM_deleteValue(key);
              }
            }
          }
        }
      } catch (error) {
        console.warn('[StorageService] Failed to clear GM storage:', error);
      }
    }

    // Clear from localStorage
    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.namespace)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('[StorageService] Failed to clear localStorage:', error);
    }
  }

  /**
   * Check if key exists in storage
   * @param key - Storage key to check
   * @example
   * if (await storage.has('config')) { /* ... */ }
   */
  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  /**
   * Get all keys in current namespace
   * @example
   * const keys = await storage.keys();
   * console.log(keys); // ['theme', 'fontSize', 'config']
   */
  async keys(): Promise<string[]> {
    const allKeys: string[] = [];

    // From GM storage
    if (this.isGMAvailable) {
      try {
        if (typeof GM_listValues !== 'undefined') {
          const gmKeys = GM_listValues();
          for (const key of gmKeys) {
            if (key.startsWith(this.namespace)) {
              allKeys.push(key.slice(this.namespace.length + 1)); // Remove namespace prefix
            }
          }
        }
      } catch (error) {
        console.warn('[StorageService] Failed to list GM keys:', error);
      }
    }

    // From localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.namespace)) {
          const cleanKey = key.slice(this.namespace.length + 1);
          if (!allKeys.includes(cleanKey)) {
            allKeys.push(cleanKey);
          }
        }
      }
    } catch (error) {
      console.warn('[StorageService] Failed to list localStorage keys:', error);
    }

    return allKeys;
  }

  /**
   * Get size of stored data (approximate)
   * @example
   * const size = await storage.size();
   * console.log(`Storage used: ${size} bytes`);
   */
  async size(): Promise<number> {
    let totalSize = 0;

    try {
      const keys = await this.keys();
      for (const key of keys) {
        const value = await this.get(key);
        if (value) {
          totalSize += JSON.stringify(value).length;
        }
      }
    } catch (error) {
      console.error('[StorageService] Failed to calculate storage size:', error);
    }

    return totalSize;
  }

  private getFullKey(key: string): string {
    return `${this.namespace}:${key}`;
  }
}

/**
 * Singleton instance for global use
 */
export const storage = new StorageService();
