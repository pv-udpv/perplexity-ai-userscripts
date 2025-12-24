/**
 * Perplexity Userscripts - Shared Utilities Library
 *
 * Central hub for all shared utilities used across scripts.
 * This barrel export ensures clean imports:
 * - import { storage, events, debounce, createManifest } from '@shared';
 */

// Storage
export { StorageService, storage } from './storage';
export type { StorageOptions } from './storage';

// Events
export { EventEmitter, events } from './events';
export type { EventMap } from './events';

// Logger
export { initializeLogger, LogLevel } from './logger';
export type { Logger } from './logger';

// Utilities
export {
  debounce,
  throttle,
  sleep,
  retryWithBackoff,
  querySafe,
  querySafeAll,
  isElementInViewport,
  generateId,
} from './utils';

// Manifest
export {
  createManifest,
  ManifestBuilder,
} from './manifest';
export type {
  UserscriptManifest,
  SimpleManifest,
  RunAt,
  GrantPermission,
  Resource,
} from './manifest';

// Manifest Generator
export {
  generateManifest,
  validateManifest,
  parseManifest,
} from './manifest-generator';
