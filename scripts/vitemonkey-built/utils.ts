/**
 * Utility functions for ViteMonkey userscript.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface Logger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

/**
 * Create a namespaced logger for consistent output.
 */
export function initializeLogger(namespace: string, level: LogLevel = LogLevel.INFO): Logger {
  const prefix = `[${namespace}]`;
  const shouldLog = (msgLevel: LogLevel) => msgLevel >= level;

  return {
    debug(...args: unknown[]) {
      if (shouldLog(LogLevel.DEBUG)) {
        console.log(prefix, ...args);
      }
    },
    info(...args: unknown[]) {
      if (shouldLog(LogLevel.INFO)) {
        console.log(prefix, ...args);
      }
    },
    warn(...args: unknown[]) {
      if (shouldLog(LogLevel.WARN)) {
        console.warn(prefix, ...args);
      }
    },
    error(...args: unknown[]) {
      if (shouldLog(LogLevel.ERROR)) {
        console.error(prefix, ...args);
      }
    },
  };
}

/**
 * Debounce a function to limit execution frequency.
 * Useful for input handlers, resize listeners, etc.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function to limit execution frequency.
 * Function executes at most once per `limit` milliseconds.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Sleep for a given duration (ms).
 * Useful for adding delays in async operations.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 100,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Retry failed without error');
}

/**
 * Safe DOM query with type safety.
 */
export function querySafe<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document,
): T | null {
  try {
    return parent.querySelector<T>(selector);
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Safe DOM query all with type safety.
 */
export function querySafeAll<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document,
): T[] {
  try {
    return Array.from(parent.querySelectorAll<T>(selector));
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return [];
  }
}

/**
 * Check if element is visible in viewport.
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Create a unique ID for tracking/analytics.
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}
