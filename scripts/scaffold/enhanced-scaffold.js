#!/usr/bin/env node

/**
 * Enhanced Scaffold Script Generator
 * 
 * Creates a new userscript plugin with auto-extracted DOM and API data.
 * Supports both simple mode (just name) and advanced mode (with DOM/API extraction).
 * 
 * Usage: 
 *   Simple: npm run scaffold my-plugin-name
 *   Advanced: npm run scaffold -- --name my-plugin --dom dom.json --api api.json --features "Feature list"
 */

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

// Parse arguments
const args = minimist(process.argv.slice(2));

// Support both simple (positional) and advanced (named) arguments
const pluginName = args.name || args._[0];
const domFile = args.dom;
const apiFile = args.api;
const features = args.features || '';
const type = args.type || 'userscript';

if (!pluginName) {
  console.error('❌ Error: Please provide a plugin name');
  console.log('Usage: npm run scaffold <plugin-name>');
  console.log('   or: npm run scaffold -- --name <name> --dom <file> --api <file>');
  process.exit(1);
}

// Validate plugin name (kebab-case)
if (!/^[a-z][a-z0-9-]*$/.test(pluginName)) {
  console.error('❌ Error: Plugin name must be kebab-case (lowercase, hyphens only)');
  console.log('Valid examples: my-plugin, chat-exporter, theme-switcher');
  console.log('Invalid: MyPlugin, my_plugin, 123plugin');
  process.exit(1);
}

const pluginDir = path.join(__dirname, '..', pluginName);

// Check if plugin already exists
if (fs.existsSync(pluginDir)) {
  console.error(`❌ Error: Plugin "${pluginName}" already exists at scripts/${pluginName}/`);
  process.exit(1);
}

// Load DOM and API data if provided
let domData = { elements: {} };
let apiData = { apis: {}, interfaces: {} };

if (domFile && fs.existsSync(domFile)) {
  console.log(`📖 Reading DOM data from ${domFile}`);
  domData = JSON.parse(fs.readFileSync(domFile, 'utf-8'));
}

if (apiFile && fs.existsSync(apiFile)) {
  console.log(`📖 Reading API data from ${apiFile}`);
  apiData = JSON.parse(fs.readFileSync(apiFile, 'utf-8'));
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

// Generate files
generateManifest(pluginDir, pluginName, pluginDisplayName);
generateIndex(pluginDir, pluginName, pluginDisplayName, features);
generateTypes(pluginDir, pluginDisplayName);
generateUtils(pluginDir, pluginDisplayName);

// Generate DOM and API files if data is available
if (Object.keys(domData.elements).length > 0) {
  generateDomFile(pluginDir, domData);
}

if (Object.keys(apiData.interfaces).length > 0) {
  generateApiFile(pluginDir, apiData);
}

generateTests(pluginDir, pluginName, domData, apiData);
generateReadme(pluginDir, pluginName, pluginDisplayName, domData, apiData, features);

// Generate SCAFFOLD_README if this is an advanced scaffold
if (domFile || apiFile) {
  generateScaffoldReadme(pluginDir, pluginName, domData, apiData);
}

// Success message
console.log('\n✅ Plugin scaffolded successfully!');
console.log(`\n📁 Location: scripts/${pluginName}/`);
console.log('\n📝 Files created:');
console.log(`   - index.ts           Main plugin code`);
console.log(`   - manifest.json      Plugin metadata`);
console.log(`   - types.ts           TypeScript definitions`);
console.log(`   - utils.ts           Helper functions`);
if (Object.keys(domData.elements).length > 0) {
  console.log(`   - dom.ts             DOM selectors (${Object.keys(domData.elements).length} elements)`);
}
if (Object.keys(apiData.interfaces).length > 0) {
  console.log(`   - api.ts             API types (${Object.keys(apiData.interfaces).length} endpoints)`);
}
console.log(`   - __tests__/         Test directory`);
console.log(`   - README.md          Plugin documentation`);

console.log('\n🚀 Next steps:');
console.log(`   1. Edit scripts/${pluginName}/index.ts`);
console.log(`   2. Run: npm run build`);
console.log(`   3. Install: dist/${pluginName}.user.js`);

/**
 * Generate manifest.json
 */
function generateManifest(dir, name, displayName) {
  const manifest = {
    name: `${displayName} - Perplexity AI`,
    namespace: 'https://github.com/pv-udpv/perplexity-ai-userscripts',
    version: '1.0.0',
    description: `${displayName} plugin for Perplexity AI`,
    author: 'pv-udpv',
    license: 'MIT',
    match: ['https://www.perplexity.ai/*'],
    grant: ['GM_setValue', 'GM_getValue', 'GM_xmlhttpRequest'],
    'run-at': 'document-idle'
  };
  
  fs.writeFileSync(
    path.join(dir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('📝 Created manifest.json');
}

/**
 * Generate index.ts
 */
function generateIndex(dir, name, displayName, features) {
  const hasFeatures = features && features.trim().length > 0;
  const featureLines = hasFeatures 
    ? features.split('\n').map(f => ` * ${f.trim()}`).join('\n')
    : ' * [Add features here]';
  
  const content = `/**
 * ${displayName}
 * 
 * Auto-scaffolded userscript
 * Generated: ${new Date().toISOString()}
 *
 * Features to implement:
${featureLines}
 */

import { initializeLogger, LogLevel } from '@shared';

const logger = initializeLogger('${name}', LogLevel.INFO);

/**
 * Initialize the plugin
 */
async function init(): Promise<void> {
  logger.info('${displayName} is starting...');
  
  try {
    // Wait for Perplexity UI to load
    await waitForElement('.main-container', 5000);
    
    // Initialize features
    setupUI();
    setupEventListeners();
    
    logger.info('${displayName} initialized successfully');
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
  
  fs.writeFileSync(path.join(dir, 'index.ts'), content);
  console.log('📝 Created index.ts');
}

/**
 * Generate types.ts
 */
function generateTypes(dir, displayName) {
  const content = `/**
 * Type definitions for ${displayName}
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
  
  fs.writeFileSync(path.join(dir, 'types.ts'), content);
  console.log('📝 Created types.ts');
}

/**
 * Generate utils.ts
 */
function generateUtils(dir, displayName) {
  const content = `/**
 * Utility functions for ${displayName}
 */

/**
 * Example utility function
 */
export function exampleUtil(input: string): string {
  return input.toUpperCase();
}
`;
  
  fs.writeFileSync(path.join(dir, 'utils.ts'), content);
  console.log('📝 Created utils.ts');
}

/**
 * Generate dom.ts with extracted DOM selectors
 */
function generateDomFile(dir, domData) {
  let content = `/**
 * Auto-generated DOM selectors
 * Elements with data-testId: ${Object.keys(domData.elements).length}
 * Generated: ${new Date().toISOString()}
 */

`;
  
  Object.entries(domData.elements).forEach(([testId, el]) => {
    // Create a valid TypeScript identifier
    const identifier = testId.replace(/[^a-zA-Z0-9]/g, '_');
    // Escape selector for use in template string
    const escapedSelector = el.selector.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    
    content += `/**
 * ${testId}
 * Type: ${el.type}
 * Selector: ${el.selector}
 */
export const ${identifier} = {
  testId: '${testId}',
  selector: '${el.selector}',
  xpath: '${el.xpath}',
  type: '${el.type}',
  element: () => document.querySelector('${escapedSelector}') as ${getElementType(el.type)} | null
};\n\n`;
  });
  
  fs.writeFileSync(path.join(dir, 'dom.ts'), content);
  console.log('📝 Created dom.ts');
}

/**
 * Get TypeScript element type based on tag name
 */
function getElementType(tagName) {
  const types = {
    'button': 'HTMLButtonElement',
    'input': 'HTMLInputElement',
    'textarea': 'HTMLTextAreaElement',
    'select': 'HTMLSelectElement',
    'a': 'HTMLAnchorElement',
    'div': 'HTMLDivElement',
    'span': 'HTMLSpanElement',
    'form': 'HTMLFormElement',
    'img': 'HTMLImageElement'
  };
  
  return types[tagName.toLowerCase()] || 'HTMLElement';
}

/**
 * Generate api.ts with extracted API types
 */
function generateApiFile(dir, apiData) {
  let content = `/**
 * Auto-generated API types
 * APIs found: ${Object.keys(apiData.interfaces).length}
 * Generated: ${new Date().toISOString()}
 */

`;
  
  Object.entries(apiData.interfaces).forEach(([name, iface]) => {
    content += `/**
 * ${iface.method} ${iface.url}
 */
export interface ${name} ${formatTypeDefinition(iface.response)}

`;
  });
  
  fs.writeFileSync(path.join(dir, 'api.ts'), content);
  console.log('📝 Created api.ts');
}

/**
 * Format type definition for TypeScript
 */
function formatTypeDefinition(type, indent = 0) {
  const spaces = '  '.repeat(indent);
  
  if (typeof type === 'string') {
    return type;
  }
  
  if (typeof type === 'object' && type !== null) {
    const fields = Object.entries(type)
      .map(([key, value]) => {
        const formattedValue = typeof value === 'object' && !Array.isArray(value)
          ? formatTypeDefinition(value, indent + 1)
          : value;
        return `${spaces}  ${key}: ${formattedValue};`;
      })
      .join('\n');
    
    return `{\n${fields}\n${spaces}}`;
  }
  
  return 'any';
}

/**
 * Generate test file
 */
function generateTests(dir, name, domData, apiData) {
  const hasDom = Object.keys(domData.elements).length > 0;
  const hasApi = Object.keys(apiData.interfaces).length > 0;
  
  let domTests = '';
  if (hasDom) {
    const firstElement = Object.keys(domData.elements)[0];
    const identifier = firstElement.replace(/[^a-zA-Z0-9]/g, '_');
    domTests = `
  describe('DOM interactions', () => {
    it('should find ${firstElement} element', () => {
      const el = document.createElement('div');
      el.setAttribute('data-testid', '${firstElement}');
      document.body.appendChild(el);
      
      expect(DOM.${identifier}.element()).toBeTruthy();
    });
  });`;
  }
  
  let apiTests = '';
  if (hasApi) {
    apiTests = `
  describe('API calls', () => {
    it('should handle API responses', () => {
      // TODO: Add API mocking and tests
      expect(true).toBe(true);
    });
  });`;
  }
  
  const content = `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exampleUtil } from '../utils';
${hasDom ? "import * as DOM from '../dom';" : ''}

describe('${name}', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('utils', () => {
    it('exampleUtil transforms input correctly', () => {
      expect(exampleUtil('hello')).toBe('HELLO');
    });
  });
${domTests}${apiTests}
});
`;
  
  fs.writeFileSync(path.join(dir, '__tests__', 'index.test.ts'), content);
  console.log('📝 Created __tests__/index.test.ts');
}

/**
 * Generate README.md
 */
function generateReadme(dir, name, displayName, domData, apiData, features) {
  const hasDom = Object.keys(domData.elements).length > 0;
  const hasApi = Object.keys(apiData.interfaces).length > 0;
  const hasFeatures = features && features.trim().length > 0;
  
  let featureSection = '';
  if (hasFeatures) {
    featureSection = `## Features to Implement

${features.split('\n').map(f => `- ${f.trim()}`).join('\n')}

`;
  }
  
  let domSection = '';
  if (hasDom) {
    const elements = Object.entries(domData.elements).slice(0, 10);
    domSection = `## DOM Elements (data-testId)

| testId | Selector | Type |
|--------|----------|------|
${elements.map(([testId, el]) => 
  `| \`${testId}\` | \`${el.selector}\` | \`${el.type}\` |`
).join('\n')}
${Object.keys(domData.elements).length > 10 ? `\n*...and ${Object.keys(domData.elements).length - 10} more elements*\n` : ''}
`;
  }
  
  let apiSection = '';
  if (hasApi) {
    const apis = Object.entries(apiData.interfaces).slice(0, 5);
    apiSection = `## API Endpoints

${apis.map(([name, iface]) => 
  `### ${name}\n- **Method**: ${iface.method}\n- **URL**: ${iface.url}\n`
).join('\n')}
${Object.keys(apiData.interfaces).length > 5 ? `*...and ${Object.keys(apiData.interfaces).length - 5} more endpoints*\n` : ''}
`;
  }
  
  const content = `# ${displayName}

Auto-scaffolded userscript.

${featureSection}${domSection}${apiSection}
## Getting Started

1. Install dependencies: \`npm install\`
2. Implement features in \`index.ts\`
3. Run tests: \`npm run test:watch -- ${name}\`
4. Build: \`npm run build\`

## Development

\`\`\`bash
# Build this plugin
npm run build

# Watch mode
npm run build:watch

# Run tests
npm run test ${name}
\`\`\`

## License

MIT
`;
  
  fs.writeFileSync(path.join(dir, 'README.md'), content);
  console.log('📝 Created README.md');
}

/**
 * Generate SCAFFOLD_README.md for PR
 */
function generateScaffoldReadme(dir, name, domData, apiData) {
  const content = `# Scaffolding Complete: ${name}

## What Was Generated

✅ **index.ts** - Entry point (ready for implementation)  
✅ **manifest.json** - Userscript metadata  
${Object.keys(apiData.interfaces).length > 0 ? `✅ **api.ts** - ${Object.keys(apiData.interfaces).length} API endpoints with types  \n` : ''}
${Object.keys(domData.elements).length > 0 ? `✅ **dom.ts** - ${Object.keys(domData.elements).length} DOM selectors (data-testId mapped)  \n` : ''}
✅ **types.ts** - TypeScript definitions  
✅ **utils.ts** - Helper functions  
✅ **__tests__/** - Test template (ready for tests)  
✅ **README.md** - Feature documentation  

## Next Steps

1. **Review generated files** to understand the structure
${Object.keys(apiData.interfaces).length > 0 ? '2. **Check api.ts** for all discovered API endpoints\n' : ''}
${Object.keys(domData.elements).length > 0 ? '3. **Check dom.ts** for all mapped DOM elements\n' : ''}
4. **Implement features** in index.ts
5. **Write tests** in __tests__/index.test.ts
6. **Run locally**: \`npm run build:watch\`
7. **Test**: \`npm run test:watch -- ${name}\`
8. **Build**: \`npm run build\`

${Object.keys(domData.elements).length > 0 ? `## Available DOM Elements

\`\`\`typescript
${Object.keys(domData.elements).slice(0, 10).map(testId => 
  `DOM.${testId.replace(/[^a-zA-Z0-9]/g, '_')}.element()`
).join('\n')}
${Object.keys(domData.elements).length > 10 ? `// ...and ${Object.keys(domData.elements).length - 10} more` : ''}
\`\`\`

` : ''}
${Object.keys(apiData.interfaces).length > 0 ? `## Available APIs

\`\`\`
${Object.entries(apiData.interfaces).slice(0, 10).map(([name, iface]) => 
  `- ${iface.method} ${iface.url}`
).join('\n')}
${Object.keys(apiData.interfaces).length > 10 ? `// ...and ${Object.keys(apiData.interfaces).length - 10} more` : ''}
\`\`\`

` : ''}
## Questions?

Check INFRASTRUCTURE_ROADMAP.md for development guides.
`;
  
  fs.writeFileSync(path.join(dir, 'SCAFFOLD_README.md'), content);
  console.log('📝 Created SCAFFOLD_README.md');
}
