# Plugin Development Guide

Complete guide for developing userscript plugins for Perplexity AI.

## Table of Contents

- [Quick Start](#quick-start)
- [Plugin Architecture](#plugin-architecture)
- [Project Setup](#project-setup)
- [Creating Your First Plugin](#creating-your-first-plugin)
- [Using Shared Utilities](#using-shared-utilities)
- [Manifest Configuration](#manifest-configuration)
- [Development Workflow](#development-workflow)
- [Testing and Debugging](#testing-and-debugging)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Examples](#examples)

---

## Quick Start

### Prerequisites

- Node.js 18+ or npm 9+
- Git
- Code editor (VSCode recommended)
- Basic TypeScript knowledge
- Familiarity with DOM APIs

### 30-Second Start

```bash
# Clone repository
git clone https://github.com/pv-udpv/perplexity-ai-userscripts.git
cd perplexity-ai-userscripts

# Install dependencies
npm install

# Create new plugin
npm run scaffold my-awesome-plugin

# Build
npm run build

# Find your plugin at dist/my-awesome-plugin.user.js
```

---

## Plugin Architecture

### Overview

This project uses a **modular plugin architecture** where each userscript is a self-contained plugin:

```
perplexity-ai-userscripts/
├── scripts/
│   ├── shared/              # Shared utilities (storage, events, logger)
│   ├── my-plugin/           # Your plugin
│   │   ├── index.ts         # Main entry point
│   │   ├── manifest.json    # Plugin metadata
│   │   ├── utils.ts         # Plugin-specific utilities
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── __tests__/       # Unit tests
│   │       └── index.test.ts
│   └── another-plugin/      # Another plugin
│       └── ...
├── dist/                    # Compiled .user.js files
├── vite.config.ts          # Build configuration
└── package.json            # Project dependencies
```

### Key Concepts

**1. Independent Plugins:**
- Each plugin is a separate folder in `scripts/`
- Plugins don't depend on each other
- Each builds to its own `.user.js` file

**2. Shared Utilities:**
- Common code lives in `scripts/shared/`
- Includes: Storage, Events, Logger, DOM utilities
- Imported via `@shared` path alias

**3. ViteMonkey Build System:**
- Vite bundles TypeScript to single-file userscripts
- Adds Tampermonkey/Violentmonkey headers
- Handles module resolution and minification

---

## Project Setup

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/perplexity-ai-userscripts.git
cd perplexity-ai-userscripts
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- **vite**: Fast build tool
- **vite-plugin-monkey**: Userscript bundler
- **typescript**: Type checking
- **vitest**: Testing framework
- **eslint/prettier**: Code quality tools

### 3. Verify Setup

```bash
# Check TypeScript
npm run type-check

# Run tests
npm run test

# Try building
npm run build
```

### 4. IDE Setup (VSCode)

Install recommended extensions:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "VisualStudioExptTeam.vscodeintellicode"
  ]
}
```

---

## Creating Your First Plugin

### Using the Scaffold Script

The fastest way to create a plugin:

```bash
npm run scaffold my-plugin-name
```

This automatically creates:
- `scripts/my-plugin-name/` directory
- `index.ts` - Main entry point with boilerplate
- `manifest.json` - Plugin metadata
- `types.ts` - TypeScript type definitions  
- `utils.ts` - Helper functions
- `__tests__/index.test.ts` - Test file
- `README.md` - Plugin documentation

### Manual Creation

**Step 1: Create Plugin Folder**

```bash
mkdir scripts/my-plugin
cd scripts/my-plugin
```

**Step 2: Create `manifest.json`**

```json
{
  "name": "My Awesome Plugin",
  "namespace": "https://github.com/YOUR_USERNAME/perplexity-ai-userscripts",
  "version": "1.0.0",
  "description": "Does something awesome on Perplexity AI",
  "author": "Your Name",
  "license": "MIT",
  "match": ["https://www.perplexity.ai/*"],
  "grant": ["GM_setValue", "GM_getValue"],
  "run-at": "document-idle"
}
```

**Step 3: Create `index.ts`**

```typescript
/**
 * My Awesome Plugin
 * 
 * Brief description of what this plugin does.
 */

import { initializeLogger, LogLevel } from '@shared';

const logger = initializeLogger('my-plugin', LogLevel.INFO);

/**
 * Initialize the plugin
 */
async function init(): Promise<void> {
  logger.info('My plugin is starting...');
  
  try {
    // Wait for Perplexity UI to load
    await waitForElement('.main-container', 5000);
    
    // Your plugin logic here
    setupUI();
    setupEventListeners();
    
    logger.info('My plugin initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize:', error);
  }
}

/**
 * Wait for DOM element to appear
 */
function waitForElement(
  selector: string, 
  timeout: number = 5000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector}`));
    }, timeout);
  });
}

/**
 * Setup UI elements
 */
function setupUI(): void {
  const button = document.createElement('button');
  button.textContent = 'Click Me!';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    z-index: 10000;
  `;
  
  button.addEventListener('click', () => {
    logger.info('Button clicked!');
    alert('Hello from My Plugin!');
  });
  
  document.body.appendChild(button);
}

/**
 * Setup event listeners
 */
function setupEventListeners(): void {
  // Listen for keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      logger.info('Keyboard shortcut activated');
      // Do something
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

**Step 4: Create `types.ts`**

```typescript
/**
 * Type definitions for My Plugin
 */

export interface PluginConfig {
  enabled: boolean;
  theme: 'light' | 'dark';
  hotkey: string;
}

export interface PluginState {
  initialized: boolean;
  lastAction: string | null;
}
```

**Step 5: Create `utils.ts`**

```typescript
/**
 * Utility functions for My Plugin
 */

/**
 * Format timestamp to readable string
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Safely get element by selector
 */
export function getElement<T extends HTMLElement>(
  selector: string
): T | null {
  return document.querySelector<T>(selector);
}
```

**Step 6: Build Your Plugin**

```bash
npm run build
```

Your plugin will be at `dist/my-plugin.user.js`

---

## Using Shared Utilities

The `scripts/shared/` folder provides reusable utilities for all plugins.

### Storage Service

Persist data across sessions:

```typescript
import { storage } from '@shared';

// Save data
await storage.set('user-preference', { theme: 'dark' });

// Load data
const preference = await storage.get<{ theme: string }>('user-preference');

// Check if exists
const hasPreference = await storage.has('user-preference');

// Remove data
await storage.remove('user-preference');

// List all keys
const keys = await storage.keys();

// Clear all plugin data
await storage.clear();
```

### Event System

Communicate between plugin components:

```typescript
import { events } from '@shared';

// Listen for events
events.on('query-submitted', (data) => {
  console.log('Query:', data.query);
});

// Emit events
events.emit('query-submitted', { query: 'example', timestamp: Date.now() });

// One-time listener
events.once('initialization-complete', () => {
  console.log('Plugin initialized');
});

// Remove all listeners
events.removeAllListeners('query-submitted');
```

### Logger

Structured logging with namespaces:

```typescript
import { initializeLogger, LogLevel } from '@shared';

const logger = initializeLogger('my-plugin', LogLevel.DEBUG);

logger.debug('Debug info', { detail: 'extra data' });
logger.info('Plugin started');
logger.warn('Something might be wrong');
logger.error('Error occurred', error);
```

### Utility Functions

Common helper functions:

```typescript
import { 
  debounce, 
  throttle, 
  sleep, 
  querySafe,
  retryWithBackoff 
} from '@shared';

// Debounce function calls
const debouncedSearch = debounce((query: string) => {
  console.log('Searching:', query);
}, 300);

// Throttle function calls
const throttledSave = throttle(() => {
  console.log('Saving...');
}, 1000);

// Async delay
await sleep(1000); // Wait 1 second

// Safe DOM queries
const button = querySafe<HTMLButtonElement>('.my-button');
if (button) {
  button.click();
}

// Retry with exponential backoff
await retryWithBackoff(async () => {
  // Try something that might fail
  return await fetchData();
}, 3, 1000);
```

---

## Manifest Configuration

The `manifest.json` file defines your plugin's metadata.

### Required Fields

```json
{
  "name": "Plugin Name",
  "version": "1.0.0",
  "description": "What your plugin does",
  "author": "Your Name",
  "license": "MIT"
}
```

### Userscript Headers

These become `@` directives in the compiled script:

```json
{
  "namespace": "https://github.com/YOUR_USERNAME/perplexity-ai-userscripts",
  "match": ["https://www.perplexity.ai/*"],
  "grant": [
    "GM_setValue",
    "GM_getValue",
    "GM_deleteValue",
    "GM_listValues",
    "GM_xmlhttpRequest"
  ],
  "run-at": "document-idle",
  "connect": ["api.example.com"]
}
```

### Field Reference

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Display name | `"Chat Exporter"` |
| `namespace` | Unique identifier | `"https://github.com/user/repo"` |
| `version` | Semantic version | `"1.0.0"` |
| `description` | Brief description | `"Export chat history to JSON"` |
| `author` | Your name/username | `"Your Name"` |
| `match` | URL patterns to run on | `["https://www.perplexity.ai/*"]` |
| `grant` | API permissions | `["GM_setValue", "GM_getValue"]` |
| `run-at` | Injection timing | `"document-idle"` or `"document-start"` |
| `connect` | External domains | `["api.example.com"]` |
| `require` | External libraries | `["https://cdn.example.com/lib.js"]` |

### Run-at Options

- `document-start`: Run as soon as possible (before DOM loads)
- `document-idle`: Run after DOM loads (default, recommended)
- `document-end`: Run when DOM parsing completes

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feat/my-plugin-name
```

### 2. Develop with Watch Mode

```bash
npm run build:watch
```

This rebuilds on file changes.

### 3. Test Locally

**Install in Tampermonkey:**

1. Open `dist/my-plugin.user.js`
2. Copy entire content
3. Open Tampermonkey Dashboard
4. Click "+" to create new script
5. Paste and save

**Or use file:// URL** (Advanced):

1. Enable file access in Tampermonkey settings
2. Add file watch: `file:///path/to/dist/my-plugin.user.js`
3. Script auto-reloads on build

### 4. Write Tests

```typescript
// scripts/my-plugin/__tests__/index.test.ts
import { describe, it, expect } from 'vitest';
import { formatTimestamp } from '../utils';

describe('my-plugin utils', () => {
  it('formats timestamp correctly', () => {
    const date = new Date('2024-01-01T12:00:00');
    const formatted = formatTimestamp(date);
    expect(formatted).toContain('12:00');
  });
});
```

Run tests:

```bash
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### 5. Lint and Format

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format with Prettier
```

### 6. Commit Changes

```bash
git add .
git commit -m "feat: add my plugin"
git push origin feat/my-plugin-name
```

### 7. Open Pull Request

1. Go to GitHub repository
2. Click "Pull requests" → "New pull request"
3. Select your branch
4. Fill out PR template
5. Submit for review

---

## Testing and Debugging

### Unit Testing

Test individual functions:

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Plugin initialization', () => {
  it('initializes with default config', () => {
    const config = loadDefaultConfig();
    expect(config.enabled).toBe(true);
  });
  
  it('handles missing storage gracefully', async () => {
    vi.stubGlobal('GM_getValue', undefined);
    const config = await loadConfig();
    expect(config).toBeDefined();
  });
});
```

### Integration Testing

Test on actual Perplexity AI:

1. Build plugin: `npm run build`
2. Install in Tampermonkey
3. Open Perplexity AI
4. Open DevTools (F12)
5. Check Console tab for logs
6. Verify functionality

### Debugging Techniques

**1. Console Logging:**

```typescript
logger.debug('Element found:', element);
console.log('[my-plugin] Current state:', state);
```

**2. Breakpoints:**

```typescript
debugger; // Pause execution here
```

Then open DevTools → Sources → find your script → execution pauses

**3. Network Monitoring:**

DevTools → Network tab → Watch GM_xmlhttpRequest calls

**4. Storage Inspection:**

```typescript
// Check what's stored
const allKeys = await storage.keys();
console.log('Stored keys:', allKeys);
```

### Common Issues

**Script doesn't run:**
- Check `@match` pattern matches current URL
- Verify script is enabled in Tampermonkey
- Check Console for errors

**Element not found:**
- Perplexity UI might have changed
- Use `waitForElement()` with timeout
- Inspect DOM to find correct selector

**Storage not working:**
- Check `@grant` includes `GM_setValue`, `GM_getValue`
- Verify permissions in Tampermonkey settings
- Test with localStorage fallback

---

## Best Practices

### Code Quality

✅ **DO:**
- Use TypeScript strict mode
- Add JSDoc comments to public functions
- Handle errors gracefully with try-catch
- Use const/let, avoid var
- Prefer async/await over callbacks

❌ **DON'T:**
- Use `any` type (use `unknown` with type guards)
- Modify global prototypes
- Use `innerHTML` with user input (XSS risk)
- Ignore TypeScript/ESLint errors
- Hardcode credentials or API keys

### Performance

✅ **DO:**
- Debounce/throttle frequent events
- Use event delegation for dynamic content
- Clean up listeners on unload
- Cache DOM queries
- Profile with DevTools before release

❌ **DON'T:**
- Poll continuously without throttling
- Create memory leaks (unused listeners)
- Block main thread for >50ms
- Make excessive DOM modifications
- Use synchronous XHR requests

### Security

✅ **DO:**
- Validate and sanitize user input
- Use `textContent` instead of `innerHTML`
- Request only needed permissions
- Follow principle of least privilege
- Respect user privacy

❌ **DON'T:**
- Use `eval()` or `Function()` constructor
- Trust external data without validation
- Make unauthorized API calls
- Store sensitive data unencrypted
- Violate Perplexity's Terms of Service

### User Experience

✅ **DO:**
- Provide clear feedback for actions
- Handle loading states
- Support keyboard shortcuts
- Make UI responsive
- Test on different screen sizes

❌ **DON'T:**
- Block user interactions
- Spam console with logs
- Make breaking changes without migration
- Ignore accessibility
- Break existing Perplexity features

---

## API Reference

### Core APIs

#### initializeLogger(namespace, level)

Create namespaced logger:

```typescript
const logger = initializeLogger('my-plugin', LogLevel.INFO);
```

#### storage.set(key, value)

Store data:

```typescript
await storage.set('config', { theme: 'dark' });
```

#### storage.get(key)

Retrieve data:

```typescript
const config = await storage.get<Config>('config');
```

#### events.on(event, callback)

Subscribe to events:

```typescript
events.on('query-submitted', (data) => {
  console.log(data);
});
```

#### events.emit(event, data)

Dispatch events:

```typescript
events.emit('query-submitted', { query: 'test' });
```

### Utility Functions

#### debounce(func, wait)

Delay execution until after wait time:

```typescript
const debouncedSave = debounce(save, 500);
```

#### throttle(func, limit)

Rate-limit execution:

```typescript
const throttledUpdate = throttle(update, 1000);
```

#### sleep(ms)

Async delay:

```typescript
await sleep(2000); // Wait 2 seconds
```

#### querySafe(selector)

Safe DOM query:

```typescript
const button = querySafe<HTMLButtonElement>('.btn');
```

---

## Examples

### Example 1: Keyboard Shortcut Plugin

```typescript
import { initializeLogger, LogLevel } from '@shared';

const logger = initializeLogger('hotkeys', LogLevel.INFO);

function init() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+K: Focus search
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const search = document.querySelector<HTMLInputElement>('input[type="search"]');
      search?.focus();
      logger.info('Search focused via hotkey');
    }
    
    // Ctrl+Shift+E: Export chat
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      exportChat();
    }
  });
}

function exportChat() {
  // Export logic
  logger.info('Chat exported');
}

init();
```

### Example 2: Theme Switcher

```typescript
import { storage, initializeLogger, LogLevel } from '@shared';

const logger = initializeLogger('theme', LogLevel.INFO);

async function init() {
  const theme = await storage.get<'light' | 'dark'>('theme') || 'light';
  applyTheme(theme);
  
  // Add theme toggle button
  const button = document.createElement('button');
  button.textContent = '🌙 Toggle Theme';
  button.onclick = toggleTheme;
  document.body.appendChild(button);
}

function applyTheme(theme: 'light' | 'dark') {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  logger.info(`Theme applied: ${theme}`);
}

async function toggleTheme() {
  const current = await storage.get<'light' | 'dark'>('theme') || 'light';
  const newTheme = current === 'light' ? 'dark' : 'light';
  await storage.set('theme', newTheme);
  applyTheme(newTheme);
}

init();
```

### Example 3: Auto-Save Plugin

```typescript
import { storage, debounce, initializeLogger, LogLevel } from '@shared';

const logger = initializeLogger('autosave', LogLevel.INFO);

const SAVE_INTERVAL = 30000; // 30 seconds

async function init() {
  const textarea = document.querySelector('textarea');
  if (!textarea) return;
  
  // Load saved content
  const saved = await storage.get<string>('draft');
  if (saved) {
    textarea.value = saved;
    logger.info('Draft restored');
  }
  
  // Auto-save on input (debounced)
  const save = debounce(async () => {
    await storage.set('draft', textarea.value);
    logger.info('Draft saved');
  }, SAVE_INTERVAL);
  
  textarea.addEventListener('input', save);
}

init();
```

---

## Next Steps

1. **Read the codebase:**
   - Explore `scripts/vitemonkey-built/` for a complete example
   - Study `scripts/shared/` to understand utilities

2. **Create your first plugin:**
   - Start small (e.g., add a button)
   - Test thoroughly
   - Iterate based on feedback

3. **Join the community:**
   - Open PRs with your plugins
   - Share feedback and ideas
   - Help improve documentation

4. **Advanced topics:**
   - Custom build configurations
   - Multi-file plugins
   - External API integrations

---

## Resources

- **Project Documentation:**
  - [README.md](./README.md) - Project overview
  - [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guide
  - [RULES.md](./RULES.md) - Code standards
  - [INSTALLATION.md](./INSTALLATION.md) - User installation guide

- **External Resources:**
  - [Tampermonkey Documentation](https://www.tampermonkey.net/documentation.php)
  - [ViteMonkey Plugin](https://github.com/lisongedu/vite-plugin-monkey)
  - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
  - [Vitest Documentation](https://vitest.dev/)

---

**Last Updated**: December 2025  
**Maintainer**: [pv-udpv](https://github.com/pv-udpv)
