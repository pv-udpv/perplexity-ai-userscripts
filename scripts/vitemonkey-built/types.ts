/**
 * Type definitions for ViteMonkey userscript.
 */

/**
 * Main script configuration.
 */
export interface ScriptConfig {
  /** Whether the script is enabled. */
  enabled: boolean;

  /** Whether debug logging is enabled. */
  debugMode: boolean;

  /** Interval for periodic updates (ms). */
  updateInterval: number;
}

/**
 * Perplexity query event.
 */
export interface PerplexityQuery {
  id: string;
  text: string;
  timestamp: number;
  model?: string;
}

/**
 * Perplexity response event.
 */
export interface PerplexityResponse {
  id: string;
  text: string;
  timestamp: number;
  sources?: string[];
}
