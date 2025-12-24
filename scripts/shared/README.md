# Shared Modules - Tier 1 Foundation

🎯 **Status**: Ready for production | Pattern: Complexity extension | Impact: ⭐⭐⭐⭐⭐

## Overview

Central library of shared utilities for all Perplexity userscripts. Eliminates code duplication and provides type-safe, cross-module communication.

### What's Included

#### 1. **StorageService** (`storage.ts`)
Unified abstraction for persistent storage with automatic fallback:
- **Primary**: Tampermonkey `GM_setValue`, `GM_getValue`, `GM_deleteValue`
- **Fallback**: Browser `localStorage` (for Violentmonkey, etc.)
- **Type-safe**: TypeScript generics for compile-time type checking
- **Namespaced**: Auto-prefixes keys to avoid collisions

**Key Methods**:
```typescript
await storage.get<T>(key)      // Get typed value or null
await storage.set<T>(key, value)  // Store any serializable value
await storage.remove(key)        // Delete a key
await storage.clear()            // Clear all namespaced values
await storage.has(key)           // Check existence
await storage.keys()             // List all keys
await storage.size()             // Get total size in bytes
```

**Example**:
```typescript
import { storage } from '@shared';

// Store config
const config = { theme: 'dark', fontSize: 14 };
await storage.set('config', config);

// Retrieve with type checking
const saved = await storage.get<typeof config>('config');
if (saved?.theme === 'dark') {
  console.log('Dark mode enabled');
}
```

#### 2. **EventEmitter** (`events.ts`)
Type-safe event system for inter-module communication:
- **Compile-time checking**: All events defined in `EventMap`
- **Multiple listeners**: Subscribe multiple handlers to same event
- **One-time listeners**: Use `.once()` for single-fire handlers
- **Error isolation**: Listener errors don't break other listeners
- **Memory safe**: Unsubscribe function returned from `.on()` and `.once()`

**Pre-defined Events**:
```typescript
'script:initialized'      // Script loaded and ready
'script:error'            // Error occurred in script
'storage:changed'         // Storage value was modified
'perplexity:query-sent'   // User sent a query
'perplexity:response-received'  // Response came back
'perplexity:error'        // API error occurred
'ui:panel-toggled'        // UI panel visibility changed
'ui:theme-changed'        // Theme switched (light/dark)
```

**Example**:
```typescript
import { events } from '@shared';

// Subscribe to queries
const unsubscribe = events.on('perplexity:query-sent', (data) => {
  console.log('Query sent:', data.query);
});

// Emit event
events.emit('perplexity:query-sent', {
  query: 'What is AI?',
  timestamp: Date.now(),
});

// One-time listener
events.once('perplexity:response-received', (data) => {
  console.log('First response received');
});

// Cleanup
unsubscribe();
```

#### 3. **Logger** (`logger.ts`)
Consistent logging with namespaced prefixes:
- **4 levels**: DEBUG, INFO, WARN, ERROR
- **Filtered output**: Only show logs >= specified level
- **Namespace prefix**: All logs show `[script-name]` prefix

**Example**:
```typescript
import { initializeLogger, LogLevel } from '@shared';

const logger = initializeLogger('my-script', LogLevel.DEBUG);

logger.info('Script initialized');      // [my-script] Script initialized
logger.warn('API rate limit approaching'); // [my-script] API rate limit approaching
logger.error('Network error');           // [my-script] Network error
```

#### 4. **Utilities** (`utils.ts`)
Common helper functions:

**Timing & Async**:
```typescript
// Debounce (delay execution until silence)
const handleSearch = debounce((query: string) => {
  search(query);
}, 300);

// Throttle (execute at most once per interval)
const handleScroll = throttle(() => {
  checkPosition();
}, 100);

// Sleep
await sleep(1000); // Wait 1 second

// Retry with exponential backoff
const data = await retryWithBackoff(
  () => fetch('/api').then(r => r.json()),
  3,   // max attempts
  100, // initial delay (ms)
);
```

**DOM Utilities**:
```typescript
// Safe queries (won't throw on invalid selectors)
const button = querySafe<HTMLButtonElement>('.submit-btn');
const messages = querySafeAll<HTMLDivElement>('[role="article"]');

// Check if element is visible
if (isElementInViewport(element)) {
  console.log('In viewport');
}

// Generate unique IDs
const requestId = generateId('api-call');
// 'api-call-1234567890-abc123def456'
```

## Quick Start (5 minutes)

### 1. Import in Your Script

```typescript
// scripts/my-script/main.ts
import { storage, events, initializeLogger } from '@shared';

const logger = initializeLogger('my-script');

(async () => {
  // Save state
  await storage.set('lastQuery', 'AI');
  
  // Listen for events
  events.on('perplexity:query-sent', (data) => {
    logger.info('Query:', data.query);
  });
  
  // Emit custom event
  events.emit('script:initialized', {
    scriptName: 'my-script',
    version: '1.0.0',
    timestamp: Date.now(),
  });
})();
```

### 2. Add to vite.config.ts (if needed)

Path aliases are already configured in `tsconfig.json`:

```typescript
// vite.config.ts
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'scripts/shared'),
    },
  },
});
```

### 3. Run Tests

```bash
# Install dependencies
uv pip install -e .

# Run all tests
npm run test

# Run shared module tests only
npm run test -- scripts/shared

# Watch mode
npm run test:watch
```

## Adding New Events

Extend the `EventMap` interface in `events.ts`:

```typescript
export interface EventMap {
  // ... existing events ...
  
  'my-feature:updated': {
    data: string;
    timestamp: number;
  };
}
```

Now you can use it with full type safety:

```typescript
events.emit('my-feature:updated', {
  data: 'new value',
  timestamp: Date.now(),
});

events.on('my-feature:updated', (data) => {
  console.log(data.data); // Type-safe!
});
```

## Migration Guide

### If You Have Existing Storage Code

**Before**:
```typescript
const value = localStorage.getItem('key');
const parsed = value ? JSON.parse(value) : null;
```

**After**:
```typescript
const parsed = await storage.get('key');
```

### If You Have Existing Event Systems

Replace custom implementations with `EventEmitter`:

```typescript
// ❌ Old way
const listeners = [];
function subscribe(cb) { listeners.push(cb); }
function emit(data) { listeners.forEach(cb => cb(data)); }

// ✅ New way
const unsubscribe = events.on('event-name', (data) => {});
```

## Best Practices

✅ **DO**:
- Use `@shared` imports for cleaner code
- Add new events to `EventMap` for type safety
- Use specific namespaces in `StorageService` per script
- Handle async/await properly with storage operations
- Unsubscribe from events when component unmounts

❌ **DON'T**:
- Don't ignore returned unsubscribe functions (memory leaks)
- Don't add sensitive data to localStorage (it's not secure)
- Don't emit events without timestamps
- Don't create new `EventEmitter` instances (use singleton `events`)
- Don't catch all storage errors silently

## File Structure

```
scripts/shared/
├── index.ts              # Barrel export (public API)
├── storage.ts            # StorageService implementation
├── storage.test.ts       # Tests for StorageService
├── events.ts             # EventEmitter implementation
├── events.test.ts        # Tests for EventEmitter
├── logger.ts             # Logger utility
├── utils.ts              # Helper functions
├── utils.test.ts         # Tests for utils (TODO)
└── README.md             # This file
```

## Performance Notes

- **Storage**: GM_* API is faster than localStorage. Falls back gracefully.
- **Events**: Uses `Set<>` for listener storage (O(1) add/remove)
- **Debounce/Throttle**: Creates single timer, efficient for high-frequency events

## Troubleshooting

**Q: Storage not persisting?**
A: Check Tampermonkey permissions. May need to whitelist script.

**Q: Event listener not firing?**
A: Make sure event name matches exactly (case-sensitive). Use IDE autocomplete.

**Q: Import `@shared` not working?**
A: Run `npm install` to ensure tsconfig.json is loaded. Restart IDE.

**Q: Listener error crashes app?**
A: EventEmitter catches errors per-listener. Check browser console for details.

---

**Last Updated**: Dec 24, 2025  
**Pattern Source**: [Complexity Extension](https://github.com/pnd280/complexity)  
**Status**: ✅ Production Ready
