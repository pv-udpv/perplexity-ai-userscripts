/**
 * Utility functions for GitHub Auto-Approve userscript.
 */

import type { AutoApproveConfig, ApprovalRule, AuditLogEntry, OperationType } from './types';

const STORAGE_KEY = 'github-auto-approve-config';
const LOG_PREFIX = '[github-auto-approve]';

/**
 * Logger utility.
 */
export const logger = {
  debug(...args: unknown[]) {
    console.log(LOG_PREFIX, ...args);
  },
  info(...args: unknown[]) {
    console.info(LOG_PREFIX, ...args);
  },
  warn(...args: unknown[]) {
    console.warn(LOG_PREFIX, ...args);
  },
  error(...args: unknown[]) {
    console.error(LOG_PREFIX, ...args);
  },
  audit(entry: AuditLogEntry) {
    console.log(
      `${LOG_PREFIX} [AUDIT]`,
      new Date(entry.timestamp).toISOString(),
      entry.action,
      entry.repository,
      entry.operationType,
      entry.matchedRule ? `(rule: ${entry.matchedRule})` : ''
    );
  },
};

/**
 * Default configuration.
 */
export const DEFAULT_CONFIG: AutoApproveConfig = {
  enabled: true,
  defaultDelay: 5,
  rules: [],
};

/**
 * Load configuration from storage.
 */
export function loadConfig(): Promise<AutoApproveConfig> {
  return Promise.resolve().then(() => {
    try {
      if (typeof GM_getValue !== 'undefined') {
        const stored = GM_getValue(STORAGE_KEY, null);
        if (stored) {
          return JSON.parse(stored) as AutoApproveConfig;
        }
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as AutoApproveConfig;
        }
      }
    } catch (error) {
      logger.error('Failed to load config:', error);
    }
    return DEFAULT_CONFIG;
  });
}

/**
 * Save configuration to storage.
 */
export function saveConfig(config: AutoApproveConfig): Promise<void> {
  return Promise.resolve().then(() => {
    try {
      const serialized = JSON.stringify(config);
      if (typeof GM_setValue !== 'undefined') {
        GM_setValue(STORAGE_KEY, serialized);
      } else {
        localStorage.setItem(STORAGE_KEY, serialized);
      }
      logger.debug('Config saved');
    } catch (error) {
      logger.error('Failed to save config:', error);
      throw error;
    }
  });
}

/**
 * Match repository pattern against actual repository name.
 * Supports wildcards: 'owner/*', '*', or exact 'owner/repo'.
 */
export function matchRepoPattern(pattern: string, repo: string): boolean {
  // Exact match
  if (pattern === repo) {
    return true;
  }
  
  // Match all
  if (pattern === '*') {
    return true;
  }
  
  // Wildcard owner: 'owner/*'
  if (pattern.endsWith('/*')) {
    const owner = pattern.slice(0, -2);
    return repo.startsWith(owner + '/');
  }
  
  // Try as regex
  try {
    const regex = new RegExp(pattern);
    return regex.test(repo);
  } catch {
    return false;
  }
}

/**
 * Match file path against glob patterns.
 * Simple implementation supporting basic wildcards.
 */
export function matchPathPatterns(patterns: string[], paths: string[]): boolean {
  if (!patterns || patterns.length === 0) {
    return true; // No restrictions
  }
  
  if (paths.length === 0) {
    return true; // No paths to check, allow
  }
  
  return paths.some(path => 
    patterns.some(pattern => matchGlob(pattern, path))
  );
}

/**
 * Simple glob matching for file paths.
 * Supports: *, **, exact matches
 */
function matchGlob(pattern: string, path: string): boolean {
  // Exact match
  if (pattern === path) {
    return true;
  }
  
  // Convert glob to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '§§') // Temporarily replace **
    .replace(/\*/g, '[^/]*') // * matches anything except /
    .replace(/§§/g, '.*') // ** matches anything including /
    .replace(/\?/g, '.'); // ? matches single char
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

/**
 * Find matching rule for a repository and operation.
 */
export function findMatchingRule(
  config: AutoApproveConfig,
  repo: string,
  operationType: string,
  filePaths: string[]
): ApprovalRule | null {
  for (const rule of config.rules) {
    // Check if rule is enabled for auto-approve
    if (!rule.autoApprove) {
      continue;
    }
    
    // Check repository pattern
    if (!matchRepoPattern(rule.repoPattern, repo)) {
      continue;
    }
    
    // Check operation type
    if (!rule.operations.includes(operationType as OperationType)) {
      continue;
    }
    
    // Check path patterns if specified
    if (!matchPathPatterns(rule.pathPatterns ?? [], filePaths)) {
      continue;
    }
    
    // All checks passed
    return rule;
  }
  
  return null;
}

/**
 * Wait for element to appear in DOM.
 */
export function waitForElement(
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
 * Generate unique ID.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Escape HTML to prevent XSS.
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
