/**
 * ViteMonkey Built - Template for Perplexity AI userscript
 *
 * This is a well-structured example of a ViteMonkey-based userscript
 * demonstrating modern TypeScript, type safety, and best practices.
 *
 * @namespace ViteMonkeyBuilt
 */

import { LogLevel, initializeLogger } from './utils';
import type { ScriptConfig } from './types';

const logger = initializeLogger('vitemonkey-built', LogLevel.DEBUG);

/**
 * Script configuration with sensible defaults.
 */
const DEFAULT_CONFIG: ScriptConfig = {
  enabled: true,
  debugMode: false,
  updateInterval: 5000,
};

/**
 * Initialize the userscript.
 * Runs after DOM is ready.
 */
async function initializeScript(): Promise<void> {
  logger.info('Initializing ViteMonkey userscript...');

  try {
    // Load user config from storage
    const config = await loadConfig();
    logger.debug('Config loaded:', config);

    // Check if script is enabled
    if (!config.enabled) {
      logger.info('Script disabled by user');
      return;
    }

    // Wait for Perplexity UI to load
    await waitForElement('.perplexity-container', 5000);
    logger.info('Perplexity UI detected');

    // Initialize features
    setupEventListeners(config);
    setupUI(config);

    logger.info('Script initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize script:', error);
  }
}

/**
 * Load configuration from browser storage.
 * Falls back to defaults if not found.
 */
async function loadConfig(): Promise<ScriptConfig> {
  try {
    const stored = typeof GM_getValue !== 'undefined' ? GM_getValue('config', null) : null;
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  } catch (error) {
    logger.warn('Failed to load config, using defaults:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save configuration to browser storage.
 */
async function saveConfig(config: Partial<ScriptConfig>): Promise<void> {
  try {
    if (typeof GM_setValue !== 'undefined') {
      GM_setValue('config', JSON.stringify(config));
    } else {
      // Fallback to localStorage if GM API unavailable
      localStorage.setItem('vitemonkey-built-config', JSON.stringify(config));
    }
    logger.debug('Config saved');
  } catch (error) {
    logger.error('Failed to save config:', error);
  }
}

/**
 * Wait for DOM element to appear (useful for dynamic content).
 * Uses MutationObserver to detect when element is added.
 */
function waitForElement(
  selector: string,
  timeout: number = 10000,
): Promise<Element> {
  return new Promise((resolve, reject) => {
    // Check if already in DOM
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutHandle);
        resolve(element);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const timeoutHandle = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector}`));
    }, timeout);
  });
}

/**
 * Setup event listeners for Perplexity interactions.
 */
function setupEventListeners(config: ScriptConfig): void {
  // Listen for query submission
  document.addEventListener('keydown', (event) => {
    // Example: Ctrl+Shift+D to toggle debug mode
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      config.debugMode = !config.debugMode;
      logger.info(`Debug mode ${config.debugMode ? 'enabled' : 'disabled'}`);
      saveConfig(config).catch(logger.error);
    }
  });

  // Listen for Perplexity custom events (if available)
  document.addEventListener('perplexity:query-sent', ((event: CustomEvent) => {
    logger.debug('Query sent:', event.detail);
  }) as EventListener);
}

/**
 * Create and inject UI elements.
 */
function setupUI(_config: ScriptConfig): void {
  try {
    // Example: Add a button to the Perplexity UI
    const container = document.querySelector('.perplexity-container');
    if (!container) {
      logger.warn('Could not find Perplexity container for UI injection');
      return;
    }

    // Create button element
    const button = document.createElement('button');
    button.textContent = 'ViteMonkey Script Active';
    button.className = 'vitemonkey-status-btn';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 15px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    button.addEventListener('click', () => {
      logger.info('ViteMonkey button clicked');
      button.textContent = button.textContent === 'ViteMonkey Script Active' ? 'Clicked!' : 'ViteMonkey Script Active';
    });

    document.body.appendChild(button);
    logger.info('UI elements injected');
  } catch (error) {
    logger.error('Failed to setup UI:', error);
  }
}

/**
 * Cleanup on script unload.
 */
function cleanup(): void {
  logger.info('Cleaning up resources...');
  // Remove injected elements
  document.querySelectorAll('.vitemonkey-status-btn').forEach((el) => el.remove());
  // Remove event listeners (delegated cleanup)
}

// Initialize script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeScript().catch(logger.error);
  });
} else {
  // DOM already loaded
  initializeScript().catch(logger.error);
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
