import type { CacheData, CacheEntry } from '../types';

export async function dumpCaches(): Promise<CacheData[]> {
  if (!('caches' in window)) {
    console.warn('Cache API not available');
    return [];
  }

  try {
    const cacheNames = await caches.keys();
    const dumps: CacheData[] = [];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      const entries: CacheEntry[] = [];
      
      for (const req of requests) {
        entries.push({
          url: req.url,
          method: req.method,
          headers: Object.fromEntries(req.headers.entries()),
          // Note: this is the time the cache entry was dumped, not when it was originally cached.
          dumped_at: new Date().toISOString(),
        });
      }

      dumps.push({
        name: cacheName,
        entries,
      });
    }

    return dumps;
  } catch (error) {
    console.error('Failed to dump caches:', error);
    return [];
  }
}
