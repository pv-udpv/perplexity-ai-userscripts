/**
 * Core Types and Interfaces for Plugin System
 * 
 * This file defines the contract between the core framework and plugins.
 */

import type { Logger } from './logger';
import type { StorageService } from './browser/storage';

/**
 * Core API provided to plugins
 */
export interface CoreAPI {
  /** UI services for creating panels, modals, and components */
  ui: UIService;
  
  /** Messaging system for inter-plugin communication */
  messaging: MessagingService;
  
  /** Storage service with namespacing support */
  storage: StorageManager;
  
  /** Configuration management */
  config: ConfigService;
  
  /** Logger factory */
  logger: LoggerService;
  
  /** Browser API abstractions */
  browser: BrowserService;
  
  /** Plugin management */
  plugins: PluginManager;
  
  /** Core version */
  version: string;
}

/**
 * Plugin interface - all plugins must implement this
 */
export interface Plugin {
  /** Unique plugin identifier (kebab-case) */
  id: string;
  
  /** Human-readable plugin name */
  name: string;
  
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  
  /** Brief description of plugin functionality */
  description: string;
  
  /** Plugin author name or email */
  author: string;
  
  /** Plugin dependencies (other plugin IDs) */
  dependencies?: string[];
  
  /** Minimum required core version */
  requiredCoreVersion?: string;
  
  /** Configuration schema */
  config?: PluginConfig;
  
  /**
   * Called when plugin is loaded into memory
   * Plugins should initialize services and register with core
   */
  onLoad?(core: CoreAPI): Promise<void> | void;
  
  /**
   * Called when plugin is enabled
   * Plugins should activate features, create UI, register listeners
   */
  onEnable?(): Promise<void> | void;
  
  /**
   * Called when plugin is disabled
   * Plugins should deactivate features, hide UI, remove listeners
   */
  onDisable?(): Promise<void> | void;
  
  /**
   * Called when plugin is unloaded from memory
   * Plugins should cleanup all resources
   */
  onUnload?(): Promise<void> | void;
}

/**
 * Plugin configuration schema
 */
export interface PluginConfig {
  [key: string]: ConfigField;
}

export interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  default: any;
  label?: string;
  description?: string;
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  required?: boolean;
}

/**
 * UI Service - provides UI creation and management
 */
export interface UIService {
  /** Create a side panel */
  createPanel(config: PanelConfig): Panel;
  
  /** Create a multi-stage side panel (HARPA-style) */
  createMultiStagePanel?(config: any): any;
  
  /** Create a modal dialog */
  createModal(config: ModalConfig): Modal;
  
  /** Show a toast notification */
  showToast(message: string, type?: ToastType, duration?: number): void;
  
  /** UI component library */
  components: UIComponents;
  
  /** Theme management */
  theme: ThemeManager;
}

export interface Panel {
  id: string;
  show(): void;
  hide(): void;
  toggle(): void;
  setContent(content: HTMLElement | string): void;
  setTitle(title: string): void;
  isVisible(): boolean;
  destroy(): void;
}

export interface PanelConfig {
  id?: string;
  title: string;
  position: 'left' | 'right';
  width?: number;
  content: HTMLElement | string;
  collapsible?: boolean;
  draggable?: boolean;
  resizable?: boolean;
}

export interface Modal {
  id: string;
  show(): void;
  hide(): void;
  setContent(content: HTMLElement | string): void;
  setTitle(title: string): void;
  destroy(): void;
}

export interface ModalConfig {
  id?: string;
  title: string;
  content: HTMLElement | string;
  width?: number;
  height?: number;
  closable?: boolean;
  actions?: ModalAction[];
}

export interface ModalAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void | Promise<void>;
}

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface UIComponents {
  button(config: ButtonConfig): HTMLButtonElement;
  input(config: InputConfig): HTMLInputElement;
  select(config: SelectConfig): HTMLSelectElement;
  checkbox(config: CheckboxConfig): HTMLInputElement;
  textarea(config: TextareaConfig): HTMLTextAreaElement;
}

export interface ButtonConfig {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
}

export interface InputConfig {
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export interface SelectConfig {
  options: Array<{ value: string; label: string }>;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export interface CheckboxConfig {
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface TextareaConfig {
  placeholder?: string;
  value?: string;
  rows?: number;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export interface ThemeManager {
  current: 'light' | 'dark';
  set(theme: 'light' | 'dark'): void;
  toggle(): void;
  onChange(callback: (theme: 'light' | 'dark') => void): () => void;
}

/**
 * Messaging Service - event bus and messaging
 */
export interface MessagingService {
  /** Emit an event to all listeners */
  emit(event: string, data?: any): void;
  
  /** Subscribe to an event */
  on(event: string, handler: EventHandler): UnsubscribeFn;
  
  /** Subscribe to an event (one-time) */
  once(event: string, handler: EventHandler): UnsubscribeFn;
  
  /** Send a request and wait for response */
  request<T = any>(target: string, data?: any): Promise<T>;
  
  /** Register a request handler */
  onRequest<T = any>(
    name: string,
    handler: (data: any) => Promise<T> | T
  ): UnsubscribeFn;
}

export type EventHandler = (data: any) => void | Promise<void>;
export type UnsubscribeFn = () => void;

/**
 * Storage Manager - provides namespaced storage
 */
export interface StorageManager {
  /** Get value from global storage */
  get<T = unknown>(key: string): Promise<T | null>;
  
  /** Set value in global storage */
  set<T = unknown>(key: string, value: T): Promise<void>;
  
  /** Remove value from global storage */
  remove(key: string): Promise<void>;
  
  /** Create a namespaced storage instance for a plugin */
  namespace(pluginId: string): StorageService;
}

/**
 * Configuration Service
 */
export interface ConfigService {
  /** Get configuration value */
  get<T = any>(key: string, defaultValue?: T): T;
  
  /** Set configuration value */
  set<T = any>(key: string, value: T): void;
  
  /** Register plugin configuration schema */
  registerSchema(pluginId: string, schema: PluginConfig): void;
  
  /** Get all config for a plugin */
  getPluginConfig(pluginId: string): Record<string, any>;
  
  /** Set all config for a plugin */
  setPluginConfig(pluginId: string, config: Record<string, any>): void;
}

/**
 * Logger Service
 */
export interface LoggerService {
  /** Create a namespaced logger */
  create(namespace: string): Logger;
}

/**
 * Browser Service - browser API abstractions
 */
export interface BrowserService {
  /** Make HTTP requests */
  xhr(config: XHRConfig): Promise<XHRResponse>;
  
  /** DOM utilities */
  dom: DOMUtils;
}

export interface XHRConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

export interface XHRResponse {
  status: number;
  statusText: string;
  responseText: string;
  responseHeaders: Record<string, string>;
  json<T = any>(): T;
}

export interface DOMUtils {
  /** Safe querySelector */
  query<T extends Element = Element>(
    selector: string,
    parent?: Element | Document
  ): T | null;
  
  /** Safe querySelectorAll */
  queryAll<T extends Element = Element>(
    selector: string,
    parent?: Element | Document
  ): T[];
  
  /** Wait for element to appear */
  waitFor<T extends Element = Element>(
    selector: string,
    timeout?: number
  ): Promise<T>;
  
  /** Check if element is in viewport */
  isInViewport(element: Element): boolean;
  
  /** Observe DOM changes */
  observe(
    target: Element,
    callback: (mutations: MutationRecord[]) => void,
    options?: MutationObserverInit
  ): () => void;
}

/**
 * Plugin Manager - manage plugin lifecycle
 */
export interface PluginManager {
  /** Get a plugin by ID */
  get(id: string): Plugin | undefined;
  
  /** Get all registered plugins */
  getAll(): Plugin[];
  
  /** Check if plugin is enabled */
  isEnabled(id: string): boolean;
  
  /** Check if plugin is loaded */
  isLoaded(id: string): boolean;
  
  /** Enable a plugin */
  enable(id: string): Promise<void>;
  
  /** Disable a plugin */
  disable(id: string): Promise<void>;
  
  /** Register a plugin */
  register(plugin: Plugin): Promise<void>;
  
  /** Unregister a plugin */
  unregister(id: string): Promise<void>;
}

/**
 * Plugin metadata from manifest.json
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license?: string;
  dependencies?: string[];
  requiredCoreVersion?: string;
  permissions?: string[];
  config?: PluginConfig;
}

/**
 * Plugin state
 */
export type PluginState = 'unloaded' | 'loaded' | 'enabled' | 'disabled' | 'error';

/**
 * Plugin registry entry
 */
export interface PluginEntry {
  plugin: Plugin;
  state: PluginState;
  error?: Error;
  enabledAt?: number;
  loadedAt?: number;
}
