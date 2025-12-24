/**
 * Namespaced Logger Utility
 * Provides consistent logging with namespace prefixes
 *
 * Pattern from: Complexity extension (pnd280/complexity)
 * Usage:
 * const logger = initializeLogger('my-script', LogLevel.DEBUG);
 * logger.info('Component mounted');
 * // Output: [my-script] Component mounted
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
 * Create a namespaced logger for consistent output across modules
 * @param namespace - Script or module name for logging prefix
 * @param level - Minimum log level to display (default: INFO)
 * @returns Logger instance
 * @example
 * const logger = initializeLogger('vitemonkey-built', LogLevel.DEBUG);
 * logger.info('Script initialized');
 * // Output: [vitemonkey-built] Script initialized
 */
export function initializeLogger(namespace: string, level: LogLevel = LogLevel.INFO): Logger {
  const prefix = `[${namespace}]`;
  const shouldLog = (msgLevel: LogLevel): boolean => msgLevel >= level;

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
