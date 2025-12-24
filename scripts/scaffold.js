#!/usr/bin/env node

/**
 * Scaffold Script Generator
 * 
 * Creates a new userscript plugin with all necessary boilerplate files.
 * 
 * Usage: npm run scaffold my-plugin-name
 */

const fs = require('fs');
const path = require('path');

// Get plugin name from command line
const pluginName = process.argv[2];

if (!pluginName) {
  console.error('❌ Error: Please provide a plugin name');
  console.log('Usage: npm run scaffold <plugin-name>');
  console.log('Example: npm run scaffold my-awesome-plugin');
  process.exit(1);
}

// Validate plugin name (kebab-case)
if (!/^[a-z][a-z0-9-]*$/.test(pluginName)) {
  console.error('❌ Error: Plugin name must be kebab-case (lowercase, hyphens only)');
  console.log('Valid examples: my-plugin, chat-exporter, theme-switcher');
  console.log('Invalid: MyPlugin, my_plugin, 123plugin');
  process.exit(1);
}

const pluginDir = path.join(__dirname, '..', 'scripts', pluginName);

// Check if plugin already exists
if (fs.existsSync(pluginDir)) {
  console.error(`❌ Error: Plugin "${pluginName}" already exists at scripts/${pluginName}/`);
  process.exit(1);
}

// Create plugin directory
console.log(`📁 Creating plugin directory: scripts/${pluginName}/`);
fs.mkdirSync(pluginDir, { recursive: true });
fs.mkdirSync(path.join(pluginDir, '__tests__'), { recursive: true });

// Convert kebab-case to Title Case for display name
const pluginDisplayName = pluginName
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

// Create manifest.json
const manifest = {
  name: `${pluginDisplayName} - Perplexity AI`,
  namespace: 'https://github.com/pv-udpv/perplexity-ai-userscripts',
  version: '1.0.0',
  description: `${pluginDisplayName} plugin for Perplexity AI`,
  author: 'pv-udpv',
  license: 'MIT',
  match: ['https://www.perplexity.ai/*'],
  grant: ['GM_setValue', 'GM_getValue'],
  'run-at': 'document-idle'
};

console.log('📝 Creating manifest.json');
fs.writeFileSync(
  path.join(pluginDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

// Create index.ts
const indexContent = `/**
 * ${pluginDisplayName}
 * 
 * [Add description of what this plugin does]
 */

import { initializeLogger, LogLevel } from '@shared';

const logger = initializeLogger('${pluginName}', LogLevel.INFO);

/**
 * Initialize the plugin
 */
async function init(): Promise<void> {
  logger.info('${pluginDisplayName} is starting...');
  
  try {
    // Wait for Perplexity UI to load
    await waitForElement('.main-container', 5000);
    
    // Initialize features
    setupUI();
    setupEventListeners();
    
    logger.info('${pluginDisplayName} initialized successfully');
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
      reject(new Error(\`Element not found: \${selector}\`));
    }, timeout);
  });
}

/**
 * Setup UI elements
 */
function setupUI(): void {
  // Add your UI elements here
  logger.info('UI setup complete');
}

/**
 * Setup event listeners
 */
function setupEventListeners(): void {
  // Add event listeners here
  document.addEventListener('keydown', (event) => {
    // Example: Ctrl+Shift+K shortcut
    if (event.ctrlKey && event.shiftKey && event.key === 'K') {
      event.preventDefault();
      logger.info('Keyboard shortcut activated');
      // Your action here
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
`;

console.log('📝 Creating index.ts');
fs.writeFileSync(path.join(pluginDir, 'index.ts'), indexContent);

// Create types.ts
const typesContent = `/**
 * Type definitions for ${pluginDisplayName}
 */

export interface PluginConfig {
  enabled: boolean;
  // Add your config options here
}

export interface PluginState {
  initialized: boolean;
  // Add your state properties here
}
`;

console.log('📝 Creating types.ts');
fs.writeFileSync(path.join(pluginDir, 'types.ts'), typesContent);

// Create utils.ts
const utilsContent = `/**
 * Utility functions for ${pluginDisplayName}
 */

/**
 * Example utility function
 */
export function exampleUtil(input: string): string {
  return input.toUpperCase();
}
`;

console.log('📝 Creating utils.ts');
fs.writeFileSync(path.join(pluginDir, 'utils.ts'), utilsContent);

// Create __tests__/index.test.ts
const testContent = `import { describe, it, expect } from 'vitest';
import { exampleUtil } from '../utils';

describe('${pluginName}', () => {
  describe('utils', () => {
    it('exampleUtil transforms input correctly', () => {
      expect(exampleUtil('hello')).toBe('HELLO');
    });
  });
  
  // Add more tests here
});
`;

console.log('📝 Creating __tests__/index.test.ts');
fs.writeFileSync(path.join(pluginDir, '__tests__', 'index.test.ts'), testContent);

// Create README.md
const readmeContent = `# ${pluginDisplayName}

[Add a brief description of what your plugin does]

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Click to install: [\`${pluginName}.user.js\`](../../dist/${pluginName}.user.js)
3. Visit [Perplexity AI](https://www.perplexity.ai)

## Usage

[Describe how to use your plugin]

## Configuration

[Describe any configuration options]

## Keyboard Shortcuts

- \`Ctrl+Shift+K\` - [Describe what this does]

## Development

\`\`\`bash
# Build this plugin
npm run build

# Watch mode
npm run build:watch

# Run tests
npm run test ${pluginName}
\`\`\`

## License

MIT
`;

console.log('📝 Creating README.md');
fs.writeFileSync(path.join(pluginDir, 'README.md'), readmeContent);

// Success message
console.log('\n✅ Plugin scaffolded successfully!');
console.log(`\n📁 Location: scripts/${pluginName}/`);
console.log('\n📝 Files created:');
console.log(`   - index.ts           Main plugin code`);
console.log(`   - manifest.json      Plugin metadata`);
console.log(`   - types.ts           TypeScript definitions`);
console.log(`   - utils.ts           Helper functions`);
console.log(`   - __tests__/         Test directory`);
console.log(`   - README.md          Plugin documentation`);

console.log('\n🚀 Next steps:');
console.log(`   1. Edit scripts/${pluginName}/index.ts`);
console.log(`   2. Run: npm run build`);
console.log(`   3. Install: dist/${pluginName}.user.js`);
console.log(`   4. Test on https://www.perplexity.ai`);

console.log('\n📚 Documentation:');
console.log('   - See PLUGIN_DEVELOPMENT_GUIDE.md for detailed help');
console.log('   - Check scripts/vitemonkey-built/ for a complete example');
