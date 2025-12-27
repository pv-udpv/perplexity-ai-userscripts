/**
 * Core Manager
 * 
 * Main entry point for the plugin system.
 * Initializes all core services and provides the CoreAPI.
 */

import type {
  CoreAPI,
  Plugin,
  UIService,
  MessagingService,
  StorageManager,
  ConfigService,
  LoggerService,
  BrowserService,
  PluginManager as IPluginManager,
} from './types';

import { initializeLogger, LogLevel, type Logger } from './logger';
import { StorageService } from './browser/storage';
import { EventEmitter } from './messaging/event-bus';
import { PluginManager } from './plugin-manager';
import { createPanel } from './ui/panel';
import { createMultiStagePanel } from './ui/multi-stage-panel';
import { generateId } from './browser/dom-utils';

const CORE_VERSION = '1.0.0';

/**
 * Core Manager Class
 */
export class CoreManager {
  private logger: Logger;
  private storage: StorageService;
  private eventBus: EventEmitter;
  private pluginManager: PluginManager;
  private coreAPI: CoreAPI;
  private initialized: boolean = false;

  constructor() {
    this.logger = initializeLogger('core', LogLevel.INFO);
    this.storage = new StorageService({ namespace: 'pplx-core' });
    this.eventBus = new EventEmitter();
    
    // Create CoreAPI
    this.coreAPI = this.createCoreAPI();
    
    // Create plugin manager with CoreAPI
    this.pluginManager = new PluginManager(this.coreAPI);
  }

  /**
   * Initialize the core framework
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Core already initialized');
      return;
    }

    this.logger.info(`Initializing Perplexity AI Core v${CORE_VERSION}...`);

    try {
      // Wait for DOM to be ready
      await this.waitForDOM();
      
      // Inject core styles
      this.injectCoreStyles();
      
      // Initialize plugins
      await this.initializePlugins();
      
      this.initialized = true;
      this.logger.info('Core initialized successfully');
      
      // Emit initialization event
      this.eventBus.emit('core:initialized', {
        version: CORE_VERSION,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error('Failed to initialize core:', error);
      throw error;
    }
  }

  /**
   * Register a plugin
   */
  async registerPlugin(plugin: Plugin): Promise<void> {
    await this.pluginManager.register(plugin);
  }

  /**
   * Get the CoreAPI
   */
  getAPI(): CoreAPI {
    return this.coreAPI;
  }

  /**
   * Create the CoreAPI object
   */
  private createCoreAPI(): CoreAPI {
    return {
      version: CORE_VERSION,
      
      ui: this.createUIService(),
      messaging: this.createMessagingService(),
      storage: this.createStorageManager(),
      config: this.createConfigService(),
      logger: this.createLoggerService(),
      browser: this.createBrowserService(),
      plugins: null as any, // Will be set after PluginManager is created
    };
  }

  /**
   * Create UI Service
   */
  private createUIService(): UIService {
    return {
      createPanel: (config) => createPanel(config),
      
      createMultiStagePanel: (config) => createMultiStagePanel(config),
      
      createModal: (config) => {
        // TODO: Implement modal
        throw new Error('Modal not implemented yet');
      },
      
      showToast: (message, type = 'info', duration = 3000) => {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `pplx-toast pplx-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 12px 20px;
          background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
          color: white;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          z-index: 10001;
          font-size: 14px;
          animation: pplx-toast-slide-in 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.animation = 'pplx-toast-slide-out 0.3s ease';
          setTimeout(() => toast.remove(), 300);
        }, duration);
      },
      
      components: {
        button: (config) => {
          const button = document.createElement('button');
          button.textContent = config.label;
          button.className = `pplx-btn pplx-btn-${config.variant || 'primary'}`;
          if (config.onClick) {
            button.addEventListener('click', config.onClick);
          }
          return button;
        },
        
        input: (config) => {
          const input = document.createElement('input');
          input.type = config.type || 'text';
          input.placeholder = config.placeholder || '';
          if (config.value) input.value = config.value;
          if (config.onChange) {
            input.addEventListener('input', (e) => {
              config.onChange!((e.target as HTMLInputElement).value);
            });
          }
          return input;
        },
        
        select: (config) => {
          const select = document.createElement('select');
          config.options.forEach((opt) => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            select.appendChild(option);
          });
          if (config.value) select.value = config.value;
          if (config.onChange) {
            select.addEventListener('change', (e) => {
              config.onChange!((e.target as HTMLSelectElement).value);
            });
          }
          return select;
        },
        
        checkbox: (config) => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = config.checked || false;
          if (config.onChange) {
            checkbox.addEventListener('change', (e) => {
              config.onChange!((e.target as HTMLInputElement).checked);
            });
          }
          return checkbox;
        },
        
        textarea: (config) => {
          const textarea = document.createElement('textarea');
          textarea.placeholder = config.placeholder || '';
          textarea.rows = config.rows || 3;
          if (config.value) textarea.value = config.value;
          if (config.onChange) {
            textarea.addEventListener('input', (e) => {
              config.onChange!((e.target as HTMLTextAreaElement).value);
            });
          }
          return textarea;
        },
      },
      
      theme: {
        current: 'light',
        set: (theme) => {
          document.documentElement.setAttribute('data-pplx-theme', theme);
        },
        toggle: () => {
          const current = document.documentElement.getAttribute('data-pplx-theme') || 'light';
          const next = current === 'light' ? 'dark' : 'light';
          document.documentElement.setAttribute('data-pplx-theme', next);
        },
        onChange: (callback) => {
          const observer = new MutationObserver(() => {
            const theme = document.documentElement.getAttribute('data-pplx-theme') as 'light' | 'dark';
            callback(theme || 'light');
          });
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-pplx-theme'],
          });
          return () => observer.disconnect();
        },
      },
    };
  }

  /**
   * Create Messaging Service
   */
  private createMessagingService(): MessagingService {
    const requestHandlers = new Map<string, (data: any) => Promise<any> | any>();

    return {
      emit: (event, data) => {
        this.eventBus.emit(event as any, data);
      },
      
      on: (event, handler) => {
        return this.eventBus.on(event as any, handler as any);
      },
      
      once: (event, handler) => {
        return this.eventBus.once(event as any, handler as any);
      },
      
      request: async (target, data) => {
        const handler = requestHandlers.get(target);
        if (!handler) {
          throw new Error(`No request handler registered for: ${target}`);
        }
        return await handler(data);
      },
      
      onRequest: (name, handler) => {
        requestHandlers.set(name, handler);
        return () => requestHandlers.delete(name);
      },
    };
  }

  /**
   * Create Storage Manager
   */
  private createStorageManager(): StorageManager {
    return {
      get: async <T>(key: string) => {
        return this.storage.get<T>(key);
      },
      
      set: async <T>(key: string, value: T) => {
        await this.storage.set(key, value);
      },
      
      remove: async (key: string) => {
        await this.storage.remove(key);
      },
      
      namespace: (pluginId: string) => {
        return new StorageService({ namespace: `pplx-plugin:${pluginId}` });
      },
    };
  }

  /**
   * Create Config Service
   */
  private createConfigService(): ConfigService {
    const configs = new Map<string, any>();
    const schemas = new Map<string, any>();

    return {
      get: <T>(key: string, defaultValue?: T): T => {
        return configs.get(key) ?? defaultValue;
      },
      
      set: <T>(key: string, value: T) => {
        configs.set(key, value);
      },
      
      registerSchema: (pluginId, schema) => {
        schemas.set(pluginId, schema);
      },
      
      getPluginConfig: (pluginId) => {
        return configs.get(`plugin:${pluginId}`) || {};
      },
      
      setPluginConfig: (pluginId, config) => {
        configs.set(`plugin:${pluginId}`, config);
      },
    };
  }

  /**
   * Create Logger Service
   */
  private createLoggerService(): LoggerService {
    return {
      create: (namespace) => initializeLogger(namespace, LogLevel.INFO),
    };
  }

  /**
   * Create Browser Service
   */
  private createBrowserService(): BrowserService {
    return {
      xhr: async (config) => {
        // TODO: Implement GM_xmlhttpRequest wrapper
        throw new Error('XHR not implemented yet');
      },
      
      dom: {
        query: (selector, parent = document) => {
          try {
            return parent.querySelector(selector);
          } catch {
            return null;
          }
        },
        
        queryAll: (selector, parent = document) => {
          try {
            return Array.from(parent.querySelectorAll(selector));
          } catch {
            return [];
          }
        },
        
        waitFor: async (selector, timeout = 10000) => {
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
                clearTimeout(timer);
                resolve(element);
              }
            });
            
            observer.observe(document.documentElement, {
              childList: true,
              subtree: true,
            });
            
            const timer = setTimeout(() => {
              observer.disconnect();
              reject(new Error(`Element not found: ${selector}`));
            }, timeout);
          });
        },
        
        isInViewport: (element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
          );
        },
        
        observe: (target, callback, options) => {
          const observer = new MutationObserver(callback);
          observer.observe(target, options);
          return () => observer.disconnect();
        },
      },
    };
  }

  /**
   * Wait for DOM to be ready
   */
  private async waitForDOM(): Promise<void> {
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
  }

  /**
   * Inject core styles
   */
  private injectCoreStyles(): void {
    const style = document.createElement('style');
    style.id = 'pplx-core-styles';
    style.textContent = `
      @keyframes pplx-toast-slide-in {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes pplx-toast-slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
      
      .pplx-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .pplx-btn-primary {
        background: #2196f3;
        color: white;
      }
      
      .pplx-btn-primary:hover {
        background: #1976d2;
      }
      
      .pplx-btn-secondary {
        background: #f5f5f5;
        color: #333;
      }
      
      .pplx-btn-secondary:hover {
        background: #e0e0e0;
      }
      
      .pplx-btn-danger {
        background: #f44336;
        color: white;
      }
      
      .pplx-btn-danger:hover {
        background: #d32f2f;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize plugins
   */
  private async initializePlugins(): Promise<void> {
    // Set plugin manager reference in CoreAPI
    (this.coreAPI.plugins as any) = this.pluginManager;
    
    // Auto-enable previously enabled plugins
    await this.pluginManager.autoEnablePlugins();
  }
}

/**
 * Create and return a core manager instance
 */
export function createCore(): CoreManager {
  return new CoreManager();
}
