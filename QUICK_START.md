# Quick Start Guide

## For Plugin Developers

### 1. Create Your First Plugin (5 minutes)

```bash
# Step 1: Create plugin directory
mkdir -p src/plugins/my-first-plugin

# Step 2: Create index.ts
cat > src/plugins/my-first-plugin/index.ts << 'EOF'
import type { Plugin, CoreAPI, Logger } from '../../core/types';

export class MyFirstPlugin implements Plugin {
  id = 'my-first-plugin';
  name = 'My First Plugin';
  version = '1.0.0';
  description = 'My awesome first plugin';
  author = 'Your Name';

  private core!: CoreAPI;
  private logger!: Logger;

  async onLoad(core: CoreAPI): Promise<void> {
    this.core = core;
    this.logger = core.logger.create(this.id);
    this.logger.info('Plugin loaded!');
  }

  async onEnable(): Promise<void> {
    this.logger.info('Plugin enabled!');
    
    // Show a welcome message
    this.core.ui.showToast('My First Plugin is active! 🎉', 'success');

    // Create a simple button
    this.addButton();
  }

  async onDisable(): Promise<void> {
    this.logger.info('Plugin disabled');
    document.getElementById('my-plugin-btn')?.remove();
  }

  private addButton(): void {
    const button = document.createElement('button');
    button.id = 'my-plugin-btn';
    button.textContent = '🚀 My Plugin';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      z-index: 10000;
    `;
    button.onclick = () => {
      this.core.ui.showToast('Button clicked!', 'info');
    };
    document.body.appendChild(button);
  }
}

export default new MyFirstPlugin();
EOF
```

### 2. Register Your Plugin

Edit `src/main.ts`:

```typescript
import MyFirstPlugin from './plugins/my-first-plugin';

async function main() {
  const core = createCore();
  await core.initialize();
  
  // Register your plugin
  await core.registerPlugin(MyFirstPlugin);
}
```

### 3. Test Your Plugin

```bash
# Build the project
npm run build

# The output will be in dist/ directory
# Load it in Tampermonkey and visit perplexity.ai
```

That's it! You've created your first plugin.

## Common Patterns

### Pattern 1: Adding a Side Panel

```typescript
async onEnable(): Promise<void> {
  this.panel = this.core.ui.createPanel({
    title: 'My Panel',
    position: 'right',
    width: 300,
    content: this.renderContent(),
  });
  this.panel.show();
}

private renderContent(): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = `
    <h3>Welcome!</h3>
    <p>This is my panel content.</p>
  `;
  return container;
}
```

### Pattern 2: Saving and Loading Data

```typescript
async onLoad(core: CoreAPI): Promise<void> {
  this.storage = core.storage.namespace(this.id);
}

async onEnable(): Promise<void> {
  // Load saved data
  const config = await this.storage.get<Config>('config');
  
  // Use data
  if (config) {
    this.applyConfig(config);
  }
}

async saveConfig(config: Config): Promise<void> {
  await this.storage.set('config', config);
  this.core.ui.showToast('Settings saved!', 'success');
}
```

### Pattern 3: Listening to Events

```typescript
async onEnable(): Promise<void> {
  this.unsubscribes = [
    this.core.messaging.on('perplexity:query-sent', (data) => {
      this.handleQuery(data);
    }),
    this.core.messaging.on('perplexity:response-received', (data) => {
      this.handleResponse(data);
    }),
  ];
}

async onDisable(): Promise<void> {
  this.unsubscribes.forEach(unsub => unsub());
}
```

### Pattern 4: Creating UI with Components

```typescript
private createSettingsUI(): HTMLElement {
  const container = document.createElement('div');
  
  // Button
  const saveBtn = this.core.ui.components.button({
    label: 'Save Settings',
    variant: 'primary',
    onClick: () => this.saveSettings(),
  });
  
  // Input
  const nameInput = this.core.ui.components.input({
    placeholder: 'Enter name...',
    value: this.config.name,
    onChange: (value) => {
      this.config.name = value;
    },
  });
  
  // Select
  const modeSelect = this.core.ui.components.select({
    options: [
      { value: 'auto', label: 'Automatic' },
      { value: 'manual', label: 'Manual' },
    ],
    value: this.config.mode,
    onChange: (value) => {
      this.config.mode = value;
    },
  });
  
  container.appendChild(nameInput);
  container.appendChild(modeSelect);
  container.appendChild(saveBtn);
  
  return container;
}
```

## Cheat Sheet

### Plugin Lifecycle

```
unloaded → onLoad(core) → loaded → onEnable() → enabled
                                         ↕
                                    onDisable()
                                         ↓
                                     disabled
                                         ↓
                                    onUnload()
                                         ↓
                                     unloaded
```

### Core API Quick Reference

```typescript
// UI
core.ui.createPanel({ title, position, width, content })
core.ui.showToast(message, type, duration)
core.ui.components.button({ label, variant, onClick })
core.ui.components.input({ placeholder, value, onChange })

// Messaging
core.messaging.emit(event, data)
core.messaging.on(event, handler)
core.messaging.once(event, handler)

// Storage
const storage = core.storage.namespace(pluginId)
await storage.set(key, value)
const data = await storage.get(key)
await storage.remove(key)

// Logger
const logger = core.logger.create(pluginId)
logger.debug('Debug message')
logger.info('Info message')
logger.warn('Warning message')
logger.error('Error message')

// Browser
const element = core.browser.dom.query('.selector')
const elements = core.browser.dom.queryAll('.selector')
const element = await core.browser.dom.waitFor('.selector', timeout)

// Plugins
const plugin = core.plugins.get('plugin-id')
const enabled = core.plugins.isEnabled('plugin-id')
await core.plugins.enable('plugin-id')
await core.plugins.disable('plugin-id')
```

### Plugin Metadata

```typescript
interface Plugin {
  id: string;              // Required: unique kebab-case ID
  name: string;            // Required: display name
  version: string;         // Required: semver (e.g., "1.0.0")
  description: string;     // Required: brief description
  author: string;          // Required: your name
  dependencies?: string[]; // Optional: plugin IDs this depends on
  requiredCoreVersion?: string; // Optional: minimum core version
}
```

## Debugging Tips

### 1. Check Logs
Open browser console and filter by your plugin name:
```javascript
// In browser console
console.log('Filtering for my-plugin logs...')
```

### 2. Use Debugger
```typescript
async onEnable(): Promise<void> {
  debugger; // Execution will pause here
  this.logger.info('After debugger');
}
```

### 3. Check Plugin State
```typescript
// In browser console
core.plugins.getState('my-plugin') // Shows current state
core.plugins.getEntry('my-plugin') // Shows full entry with error if any
```

### 4. Test Plugin Independently
```typescript
// Create a minimal test
async function testPlugin() {
  const core = createCore();
  await core.initialize();
  await core.registerPlugin(MyPlugin);
  await core.plugins.enable('my-plugin');
}
```

## Examples to Learn From

1. **hello-world** (`src/plugins/hello-world/`)
   - Basic plugin structure
   - UI button creation
   - Event handling
   - Toast notifications

2. See `docs/plugin-development.md` for more examples:
   - Simple UI Plugin
   - Data Storage Plugin
   - Event-Driven Plugin

## Common Issues

### Issue: "Plugin already registered"
**Solution**: Make sure plugin IDs are unique

### Issue: "Cannot read property of undefined"
**Solution**: Check if you're storing CoreAPI in onLoad:
```typescript
async onLoad(core: CoreAPI): Promise<void> {
  this.core = core; // Don't forget this!
}
```

### Issue: "Element not removed on disable"
**Solution**: Store references to elements and remove them:
```typescript
private elements: HTMLElement[] = [];

async onEnable(): Promise<void> {
  const btn = document.createElement('button');
  this.elements.push(btn);
  document.body.appendChild(btn);
}

async onDisable(): Promise<void> {
  this.elements.forEach(el => el.remove());
  this.elements = [];
}
```

## Next Steps

1. Read the [Plugin Development Guide](./docs/plugin-development.md)
2. Study the [Architecture Document](./PLUGIN_ARCHITECTURE.md)
3. Look at example plugins in `src/plugins/`
4. Join the community and share your plugins!

## Getting Help

- Open an issue on GitHub
- Check existing plugin examples
- Read the documentation
- Ask in community discussions

Happy coding! 🚀
