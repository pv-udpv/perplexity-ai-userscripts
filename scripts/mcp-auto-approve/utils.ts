/**
 * Utility functions for MCP Auto-Approve plugin
 */

/**
 * Match a string against a pattern (supports wildcards and basic glob)
 * 
 * Patterns:
 * - 'exact-match' - Exact string match
 * - 'prefix/*' - Wildcard match
 * - '*' - Match all
 * - '**' - Match all (glob)
 * 
 * @param value - String to test
 * @param pattern - Pattern to match against
 * @returns True if value matches pattern
 */
export function matchPattern(value: string, pattern: string): boolean {
  // Exact match
  if (value === pattern) {
    return true;
  }

  // Match all
  if (pattern === '*' || pattern === '**') {
    return true;
  }

  // Wildcard at end: 'prefix/*'
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2);
    return value.startsWith(prefix);
  }

  // Wildcard at start: '*/suffix'
  if (pattern.startsWith('*/')) {
    const suffix = pattern.slice(2);
    return value.endsWith(suffix);
  }

  // Glob patterns for file paths
  if (pattern.includes('**')) {
    const regex = globToRegex(pattern);
    return regex.test(value);
  }

  return false;
}

/**
 * Convert glob pattern to regex
 * 
 * Simplified glob implementation:
 * - `*` matches any characters except `/`
 * - `**` matches any characters including `/`
 * - `?` matches single character
 * 
 * @param glob - Glob pattern
 * @returns RegExp
 */
function globToRegex(glob: string): RegExp {
  let regex = glob
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*\*/g, '{{DOUBLE_STAR}}') // Placeholder for **
    .replace(/\*/g, '[^/]*') // * matches non-slash
    .replace(/{{DOUBLE_STAR}}/g, '.*') // ** matches anything
    .replace(/\?/g, '.'); // ? matches single char

  return new RegExp(`^${regex}$`);
}

/**
 * Extract repository from URL or string
 * 
 * @param input - URL or 'owner/repo' string
 * @returns 'owner/repo' or null
 */
export function extractRepository(input: string): string | null {
  // Already in 'owner/repo' format
  if (/^[\w-]+\/[\w-]+$/.test(input)) {
    return input;
  }

  // Extract from GitHub URL
  const githubMatch = input.match(/github\.com\/([\w-]+\/[\w-]+)/);
  if (githubMatch) {
    return githubMatch[1];
  }

  return null;
}
